const request = require('supertest');
const app = require('../index');

describe('API Health & Security Checks', () => {
  it('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/api/unknown-route-12345');
    expect(res.statusCode).toEqual(404);
  });

  it('should have security headers (Helmet)', async () => {
    const res = await request(app).get('/api/auth/verify');
    // Helmet sets X-DNS-Prefetch-Control to off by default
    expect(res.headers['x-dns-prefetch-control']).toEqual('off');
    // Helmet removes X-Powered-By
    expect(res.headers['x-powered-by']).toBeUndefined();
  });
});
