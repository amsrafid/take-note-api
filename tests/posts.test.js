const request = require('supertest');
const app = require('../src/app');
const { connectTestDB, disconnectTestDB } = require('./dbHelper');

beforeAll(() => connectTestDB('secure_notes_test_posts'));
afterAll(() => disconnectTestDB());

describe('Posts', () => {
  let token;
  let userId;

  beforeAll(async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Poster', email: 'poster@example.com', password: 'pass1234'
    });
    token = res.body.token;
    userId = res.body.user.id;
  });

  test('create a post', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Hello', content: 'World' });

    expect(res.status).toBe(201);
  });

  test("lookup a user's posts via the \$lookup aggregation", async () => {
    const res = await request(app)
      .get(`/api/posts/user/${userId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.posts.length).toBe(1);
  });

  test('rejects an invalid user id', async () => {
    const res = await request(app)
      .get('/api/posts/user/not-a-valid-id')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
  });

  test('GET /api/users lists all users for any logged-in user', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
