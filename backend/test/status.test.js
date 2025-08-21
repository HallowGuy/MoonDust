const request = require('supertest');
jest.mock('../db', () => ({ query: jest.fn() }));
const db = require('../db');
const app = require('../index');

const realFetch = global.fetch;

describe('Status API', () => {
  afterEach(() => {
    jest.clearAllMocks();
    global.fetch = realFetch;
  });

  test('GET /status returns ok statuses', async () => {
    db.query
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [{ table_exists: 'entity' }] });
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      ok: true,
      statusText: 'OK',
    });
    const res = await request(app).get('/status');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      backend: { status: 'ok', endpoints: { '/api/entity': '200 OK' } },
      database: { status: 'ok', migration: 'ok' },
    });
  });

  test('GET /status handles errors', async () => {
    db.query.mockRejectedValue(new Error('DB down'));
    global.fetch = jest.fn().mockResolvedValue({
      status: 404,
      ok: false,
      statusText: 'Not Found',
    });
    const res = await request(app).get('/status');
    expect(res.statusCode).toBe(200);
    expect(res.body.database.status).toBe('error');
    expect(res.body.backend.status).toBe('error');
    expect(res.body.backend.endpoints['/api/entity']).toBe('404 Not Found');
  });
});
