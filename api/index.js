import { getPool } from './_db.js';
import { issueToken, verifyPassword, requireAdmin } from './_auth.js';
import { readJson, readMultipart } from './_body.js';
import { uploadImage, removeImage } from './_blob.js';

export const config = { api: { bodyParser: false, responseLimit: '5mb' } };
const rate = new Map();
const statuses = new Set(['pending', 'approved', 'rejected', 'published']);

function json(res, status, value) { res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8').end(JSON.stringify(value)); }
function errorStatus(error) { return error.status || ({ UNAUTHORIZED: 401, FORBIDDEN: 403, NOT_FOUND: 404, INVALID_IMAGE_TYPE: 400, INVALID_IMAGE_CONTENT: 400, LIMIT_FILE_SIZE: 413, PAYLOAD_TOO_LARGE: 413, POST_DISABLED: 409, RATE_LIMITED: 429, INVALID_INPUT: 400, INVALID_JSON: 400, INVALID_MULTIPART: 400, BLOB_UNAVAILABLE: 503, DATABASE_UNAVAILABLE: 503, AUTH_SECRET_UNAVAILABLE: 503, INSTAGRAM_NOT_CONFIGURED: 503 }[error.message] || 500); }
function publicError(error) { const known = new Set(['INVALID_IMAGE_TYPE', 'INVALID_IMAGE_CONTENT', 'LIMIT_FILE_SIZE', 'PAYLOAD_TOO_LARGE', 'POST_DISABLED', 'RATE_LIMITED', 'INVALID_INPUT']); return known.has(error.message) ? error.message : error.status === 401 ? 'UNAUTHORIZED' : error.status === 404 ? 'NOT_FOUND' : error.message === 'INSTAGRAM_NOT_CONFIGURED' ? 'INSTAGRAM_NOT_CONFIGURED' : 'INTERNAL_SERVER_ERROR'; }
function validateText(title, content) {
  if (typeof title !== 'string' || typeof content !== 'string' || !title.trim() || !content.trim() || title.trim().length > 120 || content.length > 200) throw Object.assign(new Error('INVALID_INPUT'), { status: 400 });
  return { title: title.trim(), content: content.trim() };
}
function clientKey(req) { return String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim().slice(0, 64); }
function clientMeta(req) { return { ip: clientKey(req), userAgent: String(req.headers['user-agent'] || '').slice(0, 512) }; }
function checkPostRate(req) {
  const limit = Number(process.env.POST_RATE_LIMIT || 5);
  const windowMs = Number(process.env.POST_RATE_WINDOW_SECONDS || 3600) * 1000;
  const key = clientKey(req), now = Date.now();
  const existing = (rate.get(key) || []).filter(time => now - time < windowMs);
  if (existing.length >= limit) throw Object.assign(new Error('RATE_LIMITED'), { status: 429 });
  existing.push(now); rate.set(key, existing);
  if (rate.size > 10000) for (const [storedKey, timestamps] of rate) if (!timestamps.some(time => now - time < windowMs)) rate.delete(storedKey);
}
async function setting(pool, key, fallback) { const result = await pool.query('select value from settings where key = $1', [key]); return result.rows[0]?.value ?? fallback; }
async function log(pool, adminId, type, action, targetId = null, req = null) {
  const meta = req ? clientMeta(req) : { ip: null, userAgent: null };
  await pool.query('insert into audit_logs (admin_id, type, action, target_id, request_ip, request_user_agent) values ($1, $2, $3, $4, $5, $6)', [adminId || null, type, action, targetId, meta.ip, meta.userAgent]);
}
function postDto(row) { return { id: row.id, title: row.title, content: row.content, image: row.image_url, status: row.status, date: new Date(row.created_at).toISOString(), createdAt: row.created_at, updatedAt: row.updated_at }; }
function adminPostDto(row) { return { ...postDto(row), ip: row.client_ip || null, userAgent: row.client_user_agent || null }; }

async function handlePostSubmission(req, res) {
  checkPostRate(req);
  const pool = getPool();
  if (await setting(pool, 'isPostEnabled', true) === false) throw Object.assign(new Error('POST_DISABLED'), { status: 409 });
  const { fields, image } = await readMultipart(req);
  const text = validateText(fields.title, fields.content);
  const uploaded = image ? await uploadImage(image) : null;
  try {
    const meta = clientMeta(req);
    const result = await pool.query('insert into posts (title, content, image_url, image_path, image_content_type, client_ip, client_user_agent) values ($1, $2, $3, $4, $5, $6, $7) returning id, created_at', [text.title, text.content, uploaded?.url || null, uploaded?.pathname || null, uploaded?.contentType || null, meta.ip, meta.userAgent]);
    return json(res, 201, { id: result.rows[0].id, status: 'pending', date: result.rows[0].created_at });
  } catch (error) { if (uploaded) await removeImage(uploaded.pathname).catch(() => {}); throw error; }
}

async function login(req, res) {
  const body = await readJson(req);
  if (typeof body.username !== 'string' || typeof body.password !== 'string' || body.username.length > 100 || body.password.length > 200) throw Object.assign(new Error('INVALID_INPUT'), { status: 400 });
  const pool = getPool();
  const result = await pool.query('select id, username, password_hash from admins where username = $1', [body.username.trim()]);
  const admin = result.rows[0];
  if (!admin || !(await verifyPassword(body.password, admin.password_hash))) throw Object.assign(new Error('UNAUTHORIZED'), { status: 401 });
  await log(pool, admin.id, 'SUCCESS', '管理員登入');
  return json(res, 200, { token: issueToken(admin), admin: { id: admin.id, username: admin.username } });
}

async function dashboard(req, res, admin) {
  const pool = getPool();
  const range = new URL(req.url, 'http://localhost').searchParams.get('range') === '30' ? 30 : 7;
  const [total, status, type, periods, trend, recent, hours] = await Promise.all([
    pool.query('select count(*)::int as count from posts'),
    pool.query('select status, count(*)::int as count from posts group by status'),
    pool.query('select count(*) filter (where image_url is not null)::int as images, count(*) filter (where image_url is null)::int as text from posts'),
    pool.query("select count(*) filter (where created_at >= date_trunc('day', now() at time zone 'Asia/Taipei') at time zone 'Asia/Taipei')::int as today, count(*) filter (where created_at >= (date_trunc('day', now() at time zone 'Asia/Taipei') - interval '6 days') at time zone 'Asia/Taipei')::int as week, count(*) filter (where created_at >= date_trunc('month', now() at time zone 'Asia/Taipei') at time zone 'Asia/Taipei')::int as month from posts"),
    pool.query("select to_char(day, 'YYYY-MM-DD') as bucket, count(p.id)::int as count, count(p.id) filter (where p.status = 'pending')::int as pending, count(p.id) filter (where p.status = 'approved')::int as approved, count(p.id) filter (where p.status = 'rejected')::int as rejected from generate_series((now() at time zone 'Asia/Taipei')::date - ($1::int - 1), (now() at time zone 'Asia/Taipei')::date, interval '1 day') day left join posts p on p.created_at >= day at time zone 'Asia/Taipei' and p.created_at < (day + interval '1 day') at time zone 'Asia/Taipei' group by day order by day", [range]),
    pool.query('select * from posts order by created_at desc limit 10'),
    pool.query("select case when extract(hour from created_at at time zone 'Asia/Taipei') < 6 then '00-06' when extract(hour from created_at at time zone 'Asia/Taipei') < 12 then '06-12' when extract(hour from created_at at time zone 'Asia/Taipei') < 18 then '12-18' else '18-24' end as bucket, count(*)::int as count from posts where created_at >= now() - interval '30 days' group by bucket order by bucket")
  ]);
  return json(res, 200, { range, totalPosts: total.rows[0].count, imagePostsCount: type.rows[0].images, textPostsCount: type.rows[0].text, statusCounts: Object.fromEntries(status.rows.map(row => [row.status, row.count])), periodCounts: periods.rows[0], trend: trend.rows, timeBuckets: hours.rows, recentPosts: recent.rows.map(postDto), admin: { id: admin.sub, username: admin.username } });
}

function listParams(req) {
  const url = new URL(req.url, 'http://localhost');
  const page = Math.max(1, Math.min(10000, Number.parseInt(url.searchParams.get('page') || '1', 10) || 1));
  const pageSize = Math.max(1, Math.min(50, Number.parseInt(url.searchParams.get('pageSize') || '20', 10) || 20));
  const selectedStatuses = (url.searchParams.get('status') || '').split(',').filter(value => statuses.has(value));
  const type = url.searchParams.get('type'), q = (url.searchParams.get('q') || '').trim().slice(0, 100);
  return { page, pageSize, statuses: selectedStatuses, type: type === 'image' || type === 'text' ? type : null, q, from: url.searchParams.get('from'), to: url.searchParams.get('to') };
}

async function posts(req, res, admin) {
  const { page, pageSize, statuses: selectedStatuses, type, q, from, to } = listParams(req);
  const params = [], where = [];
  const add = (sql, value) => { params.push(value); where.push(sql.replace('?', `$${params.length}`)); };
  if (selectedStatuses.length === 1) add('status = ?', selectedStatuses[0]);
  else if (selectedStatuses.length > 1) { params.push(selectedStatuses); where.push(`status = any($${params.length})`); }
  if (type === 'image') where.push('image_url is not null');
  if (type === 'text') where.push('image_url is null');
  if (q) { params.push(`%${q}%`, `%${q}%`); where.push(`(title ilike $${params.length - 1} or content ilike $${params.length})`); }
  if (from && /^\d{4}-\d{2}-\d{2}$/.test(from)) add('created_at >= ?::date', from);
  if (to && /^\d{4}-\d{2}-\d{2}$/.test(to)) add("created_at < (?::date + interval '1 day')", to);
  const clause = where.length ? `where ${where.join(' and ')}` : '', pool = getPool();
  const count = await pool.query(`select count(*)::int as count from posts ${clause}`, params);
  const offset = (page - 1) * pageSize;
  const result = await pool.query(`select * from posts ${clause} order by created_at desc, id desc limit $${params.length + 1} offset $${params.length + 2}`, [...params, pageSize, offset]);
  return json(res, 200, { items: result.rows.map(postDto), pagination: { page, pageSize, total: count.rows[0].count, totalPages: Math.ceil(count.rows[0].count / pageSize) } });
}

async function postDetail(req, res, admin, id) {
  const pool = getPool();
  const post = await pool.query('select * from posts where id = $1', [id]);
  if (!post.rowCount) throw Object.assign(new Error('NOT_FOUND'), { status: 404 });
  const history = await pool.query('select id, from_status as "fromStatus", to_status as "toStatus", created_at as "createdAt" from post_status_history where post_id = $1 order by created_at desc', [id]);
  return json(res, 200, { ...adminPostDto(post.rows[0]), history: history.rows });
}

async function updatePost(req, res, admin, id) {

  const body = await readJson(req), text = validateText(body.title, body.content), pool = getPool();
  const result = await pool.query('update posts set title = $1, content = $2, updated_at = now() where id = $3 returning *', [text.title, text.content, id]);
  if (!result.rowCount) throw Object.assign(new Error('NOT_FOUND'), { status: 404 });
  await log(pool, admin.sub, 'SUCCESS', '編輯投稿', id); return json(res, 200, postDto(result.rows[0]));
}

async function updateStatus(req, res, admin, id) {
  const body = await readJson(req);
  if (!statuses.has(body.status) || body.status === 'pending') throw Object.assign(new Error('INVALID_INPUT'), { status: 400 });
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query('begin');
    const current = await client.query('select * from posts where id = $1 for update', [id]);
    if (!current.rowCount) throw Object.assign(new Error('NOT_FOUND'), { status: 404 });
    const result = await client.query('update posts set status = $1, updated_at = now() where id = $2 returning *', [body.status, id]);
    await client.query('insert into post_status_history (post_id, from_status, to_status, admin_id) values ($1, $2, $3, $4)', [id, current.rows[0].status, body.status, admin.sub]);
    await client.query('commit');
    await log(pool, admin.sub, 'SUCCESS', `投稿狀態更新為 ${body.status}`, id, req);
    return json(res, 200, postDto(result.rows[0]));
  } catch (error) {
    await client.query('rollback').catch(() => {});
    throw error;
  } finally { client.release(); }
}

async function settings(req, res, admin) {
  const pool = getPool();
  if (req.method === 'GET') {
    const [enabled, lastLog, pending] = await Promise.all([
      setting(pool, 'isPostEnabled', true),
      pool.query('select action, created_at as "createdAt" from audit_logs order by created_at desc limit 1').catch(() => ({ rows: [] })),
      pool.query("select count(*)::int as count from posts where status = 'pending'")
    ]);
    return json(res, 200, {
      isPostEnabled: enabled,
      site: { name: '天母匿名', domain: process.env.CORS_ORIGIN || 'https://www.tmjhnew.com', version: '2.0.26', environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development' },
      health: { database: true, blob: Boolean(process.env.BLOB_READ_WRITE_TOKEN), api: true, pendingPosts: pending.rows[0].count, lastActivity: lastLog.rows[0]?.createdAt || null }
    });
  }
  const body = await readJson(req);
  if (typeof body.isPostEnabled !== 'boolean') throw Object.assign(new Error('INVALID_INPUT'), { status: 400 });
  await pool.query("insert into settings (key, value, updated_at) values ('isPostEnabled', $1, now()) on conflict (key) do update set value = excluded.value, updated_at = now()", [JSON.stringify(body.isPostEnabled)]);
  await log(pool, admin.sub, 'SUCCESS', `投稿開關：${body.isPostEnabled ? '開啟' : '關閉'}`, null, req);
  return json(res, 200, { isPostEnabled: body.isPostEnabled });
}

async function downloadImage(res, id) {
  const result = await getPool().query("select image_url, image_content_type from posts where id = $1 and status in ('approved', 'published')", [id]);
  const post = result.rows[0];
  if (!post?.image_url) throw Object.assign(new Error('NOT_FOUND'), { status: 404 });
  const response = await fetch(post.image_url);
  if (!response.ok) throw Object.assign(new Error('NOT_FOUND'), { status: 404 });
  const buffer = Buffer.from(await response.arrayBuffer());
  return res.status(200).setHeader('Content-Type', post.image_content_type || 'application/octet-stream').setHeader('Content-Disposition', `attachment; filename="tianmu-post-${id}"`).end(buffer);
}

async function instagram(res, action) {
  if (action === 'status') return json(res, 200, { connected: false, manualPublishing: true, configured: false });
  if (action === 'disconnect') return json(res, 200, { connected: false, manualPublishing: true });
  throw Object.assign(new Error('INSTAGRAM_NOT_CONFIGURED'), { status: 503 });
}

export default async function handler(req, res) {
  const origin = process.env.CORS_ORIGIN;
  if (origin && req.headers.origin && req.headers.origin !== origin) return json(res, 403, { error: 'FORBIDDEN' });
  res.setHeader('Cache-Control', 'no-store').setHeader('X-Content-Type-Options', 'nosniff').setHeader('X-Frame-Options', 'DENY');
  if (req.method === 'OPTIONS') return res.status(204).end();
  const path = new URL(req.url, 'http://localhost').pathname.replace(/^\/api\/?/, '').split('/').filter(Boolean);
  try {
    if (path.join('/') === 'posts' && req.method === 'POST') return await handlePostSubmission(req, res);
    if (path.join('/') === 'admin/login' && req.method === 'POST') return await login(req, res);
    const admin = requireAdmin(req);
    if (path.join('/') === 'admin/me' && req.method === 'GET') return json(res, 200, { id: admin.sub, username: admin.username });
    if (path.join('/') === 'admin/dashboard' && req.method === 'GET') return await dashboard(req, res, admin);
    if (path.join('/') === 'admin/posts' && req.method === 'GET') return await posts(req, res, admin);
    if (path.length === 3 && path[0] === 'admin' && path[1] === 'posts' && req.method === 'GET') return await postDetail(req, res, admin, path[2]);
    if (path.length === 4 && path[0] === 'admin' && path[1] === 'posts' && path[3] === 'status' && req.method === 'PUT') return await updateStatus(req, res, admin, path[2]);
    if (path.length === 3 && path[0] === 'admin' && path[1] === 'posts' && req.method === 'PUT') return await updatePost(req, res, admin, path[2]);
    if (path.length === 4 && path[0] === 'admin' && path[1] === 'posts' && path[3] === 'instagram-image' && req.method === 'GET') return await downloadImage(res, path[2]);
    if (path.join('/') === 'admin/settings' && ['GET', 'PUT'].includes(req.method)) return await settings(req, res, admin);
    if (path.join('/') === 'admin/logs' && req.method === 'GET') { const result = await getPool().query('select id, type, action, target_id as "targetId", created_at as "createdAt" from audit_logs order by created_at desc limit 200'); return json(res, 200, result.rows); }
    if (path.length === 3 && path[0] === 'admin' && path[1] === 'instagram') return await instagram(res, path[2]);
    throw Object.assign(new Error('NOT_FOUND'), { status: 404 });
  } catch (error) {
    console.error('API request failed:', error.message);
    return json(res, errorStatus(error), { error: publicError(error) });
  }
}
