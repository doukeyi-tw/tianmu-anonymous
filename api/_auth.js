import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';

const tokenTtlSeconds = 8 * 60 * 60;

function secret() {
  if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32) throw new Error('AUTH_SECRET_UNAVAILABLE');
  return process.env.AUTH_SECRET;
}

export async function hashPassword(password) { return bcrypt.hash(password, 12); }
export async function verifyPassword(password, hash) { return bcrypt.compare(password, hash); }

export function issueToken(admin) {
  const payload = { sub: String(admin.id), username: admin.username, exp: Math.floor(Date.now() / 1000) + tokenTtlSeconds };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', secret()).update(body).digest('base64url');
  return `${body}.${signature}`;
}

export function readToken(request) {
  const header = request.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  const [body, signature] = header.slice(7).split('.');
  if (!body || !signature) return null;
  const expected = crypto.createHmac('sha256', secret()).update(body).digest('base64url');
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    return payload.sub && payload.exp >= Math.floor(Date.now() / 1000) ? payload : null;
  } catch { return null; }
}

export function requireAdmin(request) {
  const admin = readToken(request);
  if (!admin) throw Object.assign(new Error('UNAUTHORIZED'), { status: 401 });
  return admin;
}
