const request = require('supertest');
const app = require('../src/app');
const { connectTestDB, disconnectTestDB } = require('./dbHelper');

beforeAll(() => connectTestDB('secure_notes_test_auth'));
afterAll(() => disconnectTestDB());

describe('Auth', () => {
  const user = { name: 'Auth Test', email: 'auth-test@example.com', password: 'pass1234' };

  test('register creates a user with role "user" even if role is sent in body', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...user, role: 'admin' });

    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('user');
    expect(res.body.token).toBeDefined();
  });

  test('register rejects a duplicate email', async () => {
    const res = await request(app).post('/api/auth/register').send(user);
    expect(res.status).toBe(400);
  });

  test('login succeeds with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: user.password });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test('login fails with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: 'wrongpass' });

    expect(res.status).toBe(401);
  });

  test('GET /api/auth/me requires a token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
