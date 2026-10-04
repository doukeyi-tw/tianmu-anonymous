import { afterEach, describe, expect, it } from 'vitest';
import { hashPassword, issueToken, readToken, verifyPassword } from '../api/_auth.js';

const originalSecret = process.env.AUTH_SECRET;
afterEach(() => { if (originalSecret === undefined) delete process.env.AUTH_SECRET; else process.env.AUTH_SECRET = originalSecret; });

describe('admin authentication', () => {
  it('hashes and verifies passwords without exposing the original', async () => {
    const hash = await hashPassword('correct horse battery staple');
    expect(hash).not.toContain('correct horse');
    expect(await verifyPassword('correct horse battery staple', hash)).toBe(true);
    expect(await verifyPassword('wrong password', hash)).toBe(false);
  });
  it('rejects tampered bearer tokens', () => {
    process.env.AUTH_SECRET = '12345678901234567890123456789012';
    const token = issueToken({ id: 7, username: 'admin' });
    expect(readToken({ headers: { authorization: `Bearer ${token}` } })).toMatchObject({ sub: '7', username: 'admin' });
    expect(readToken({ headers: { authorization: `Bearer ${token}x` } })).toBeNull();
  });
});
