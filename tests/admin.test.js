const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const { connectTestDB, disconnectTestDB } = require('./dbHelper');

beforeAll(() => connectTestDB('secure_notes_test_admin'));
afterAll(() => disconnectTestDB());

describe('Admin', () => {
  let adminToken;
  let normalToken;
  let createdUserId;

  beforeAll(async () => {
    const normal = await request(app).post('/api/auth/register').send({
      name: 'Normal', email: 'normal@example.com', password: 'pass1234'
    });
    normalToken = normal.body.token;

    await request(app).post('/api/auth/register').send({
      name: 'Admin', email: 'admin@example.com', password: 'pass1234'
    });
    await User.updateOne({ email: 'admin@example.com' }, { role: 'admin' });

    const adminLogin = await request(app).post('/api/auth/login').send({
      email: 'admin@example.com', password: 'pass1234'
    });
    adminToken = adminLogin.body.token;
  });

  test('non-admin is blocked from admin routes', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${normalToken}`);

    expect(res.status).toBe(403);
  });

  test('admin can list users (paginated)', async () => {
    const res = await request(app)
      .get('/api/admin/users?page=1&limit=5')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('totalPages');
  });

  test('admin can add a user', async () => {
    const res = await request(app)
      .post('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Added', email: 'added@example.com', password: 'pass1234', interests: ['chess'] });

    expect(res.status).toBe(201);
    createdUserId = res.body.id;
  });

  test('admin can update a user', async () => {
    const res = await request(app)
      .put(`/api/admin/users/${createdUserId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Added Updated' });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Added Updated');
  });

  test('admin can view the grouped-by-interests aggregation', async () => {
    const res = await request(app)
      .get('/api/admin/users/grouped-by-interests')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test("admin can view everyone's notes", async () => {
    const res = await request(app)
      .get('/api/admin/notes?page=1&limit=5')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('totalPages');
  });

  test('admin can delete a user', async () => {
    const res = await request(app)
      .delete(`/api/admin/users/${createdUserId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });
});
