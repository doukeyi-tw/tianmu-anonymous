import { Pool } from 'pg';

let pool;

export function getPool() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_UNAVAILABLE');
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: true }, max: 3, idleTimeoutMillis: 10000, connectionTimeoutMillis: 10000 });
  }
  return pool;
}
