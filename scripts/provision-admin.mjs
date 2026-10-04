import { getPool } from '../api/_db.js';
import { hashPassword } from '../api/_auth.js';

if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) throw new Error('ADMIN_USERNAME and ADMIN_PASSWORD are required');
const pool = getPool();
const passwordHash = await hashPassword(process.env.ADMIN_PASSWORD);
await pool.query('insert into admins (username, password_hash) values ($1, $2) on conflict (username) do update set password_hash = excluded.password_hash', [process.env.ADMIN_USERNAME, passwordHash]);
await pool.end();
console.log(`Admin provisioned: ${process.env.ADMIN_USERNAME}`);
