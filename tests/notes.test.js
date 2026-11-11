const request = require('supertest');
const app = require('../src/app');
const { connectTestDB, disconnectTestDB } = require('./dbHelper');

beforeAll(() => connectTestDB('secure_notes_test_notes'));
afterAll(() => disconnectTestDB());

describe('Notes', () => {
  let ownerToken;
  let otherToken;
  let noteId;

  beforeAll(async () => {
    const owner = await request(app).post('/api/auth/register').send({
      name: 'Owner', email: 'owner@example.com', password: 'pass1234'
    });
    ownerToken = owner.body.token;

    const other = await request(app).post('/api/auth/register').send({
      name: 'Other', email: 'other@example.com', password: 'pass1234'
    });
    otherToken = other.body.token;
  });

  test('create note', async () => {
    const res = await request(app)
      .post('/api/notes')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ title: 'T1', content: 'C1' });

    expect(res.status).toBe(201);
    noteId = res.body._id;
  });

  test('list own notes is paginated', async () => {
    const res = await request(app)
      .get('/api/notes?page=1&limit=5')
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body).toHaveProperty('totalPages');
  });

  test('owner can fetch the note by id', async () => {
    const res = await request(app)
      .get(`/api/notes/${noteId}`)
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
  });

  test("another user cannot fetch someone else's note (IDOR protection)", async () => {
    const res = await request(app)
      .get(`/api/notes/${noteId}`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(res.status).toBe(404);
  });

  test("another user cannot update someone else's note", async () => {
    const res = await request(app)
      .put(`/api/notes/${noteId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ title: 'hacked' });

    expect(res.status).toBe(404);
  });

  test('owner can update the note', async () => {
    const res = await request(app)
      .put(`/api/notes/${noteId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ title: 'Updated' });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Updated');
  });

  test('owner can delete the note', async () => {
    const res = await request(app)
      .delete(`/api/notes/${noteId}`)
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
  });

  test('no token is rejected', async () => {
    const res = await request(app).get('/api/notes');
    expect(res.status).toBe(401);
  });
});
