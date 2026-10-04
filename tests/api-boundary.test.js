import { describe, expect, it } from 'vitest';
import handler from '../api/index.js';

function response() {
  const result = { statusCode: 0, headers: {}, body: '' };
  return Object.assign(result, {
    status(code) { result.statusCode = code; return this; },
    setHeader(key, value) { result.headers[key] = value; return this; },
    end(body = '') { result.body = body; return this; }
  });
}

describe('API boundary', () => {
  it('rejects admin requests without a bearer token', async () => {
    process.env.AUTH_SECRET = '12345678901234567890123456789012';
    const res = response();
    await handler({ method: 'GET', url: '/api/admin/me', headers: {} }, res);
    expect(res.statusCode).toBe(401);
    expect(JSON.parse(res.body)).toEqual({ error: 'UNAUTHORIZED' });
  });

  it('rejects invalid cross-origin requests before database access', async () => {
    process.env.CORS_ORIGIN = 'https://www.tmjhnew.com';
    const res = response();
    await handler({ method: 'GET', url: '/api/admin/me', headers: { origin: 'https://attacker.example' } }, res);
    expect(res.statusCode).toBe(403);
    delete process.env.CORS_ORIGIN;
  });
});
