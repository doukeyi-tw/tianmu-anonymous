import fs from 'node:fs/promises';
import path from 'node:path';
import { getPool } from '../api/_db.js';

const pool = getPool();
const migration = await fs.readFile(path.join(process.cwd(), 'db', '001_initial.sql'), 'utf8');
await pool.query(migration);
await pool.end();
console.log('Database migration applied.');
