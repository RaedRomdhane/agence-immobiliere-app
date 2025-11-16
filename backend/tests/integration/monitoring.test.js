const request = require('supertest');
const app = require('../../src/app');

describe('Monitoring endpoints', () => {
  test('GET /health returns 200 and JSON', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'OK');
  });

  test('GET /metrics returns prometheus metrics', async () => {
    const res = await request(app).get('/metrics');
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/plain|application\/openmetrics-text/);
    // should include at least default metrics prefix
    expect(res.text).toMatch(/app_/);
  });
});
