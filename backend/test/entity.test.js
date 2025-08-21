const request = require('supertest');
jest.mock('../db', () => ({ query: jest.fn() }));
const db = require('../db');
const app = require('../index');

describe('Entity API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('GET /api/entity returns rows', async () => {
    const rows = [{ id: 1, name: 'Test', created_at: '2024-01-01' }];
    db.query.mockResolvedValue({ rows });
    const res = await request(app).get('/api/entity');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(rows);
  });

  test('POST /api/entity inserts row', async () => {
    const row = { id: 1, name: 'Test', created_at: '2024-01-01' };
    db.query.mockResolvedValue({ rows: [row] });
    const res = await request(app).post('/api/entity').send({ name: 'Test' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual(row);
  });

  test('POST /api/entity validates name', async () => {
    const res = await request(app).post('/api/entity').send({ name: '' });
    expect(res.statusCode).toBe(400);
  });
});
