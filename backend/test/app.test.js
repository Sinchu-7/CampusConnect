const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
process.env['JWT_SECRET'] = 'x'.repeat(48);
process.env.CLIENT_ORIGIN = 'http://localhost:3000';

const createApp = require('../app');
const User = require('../models/User');
const { allowRoles } = require('../middleware/auth');

const app = createApp();

test('health endpoint responds without a database connection', async () => {
  const response = await request(app).get('/api/health').expect(200);
  assert.deepEqual(response.body, { status: 'ok' });
});

test('frontend entry point and client script are served by Express', async () => {
  const page = await request(app).get('/').expect(200);
  assert.match(page.text, /CampusConnect/);
  const script = await request(app).get('/app.js').expect(200);
  assert.match(script.text, /\/api\/auth\/login/);
});

test('protected API routes reject unauthenticated requests', async () => {
  await request(app).get('/api/dashboard').expect(401);
  await request(app).get('/api/users').expect(401);
  await request(app).get('/api/records/marks').expect(401);
  await request(app).get('/api/academics/students').expect(401);
});

test('registration rejects public administrator account creation', async () => {
  const response = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Test Admin', email: 'admin@example.edu', password: 'a-long-test-password', role: 'admin' })
    .expect(400);
  assert.match(response.body.error, /Only student and faculty/);
  assert.equal(response.headers['set-cookie'], undefined);
});

test('unknown API routes return a JSON 404', async () => {
  const response = await request(app).get('/api/not-a-route').expect(404);
  assert.deepEqual(response.body, { error: 'API route not found.' });
});

test('malformed JSON receives a client error', async () => {
  const response = await request(app)
    .post('/api/auth/register')
    .set('Content-Type', 'application/json')
    .send('{"name":')
    .expect(400);
  assert.match(response.body.error, /valid JSON/);
});

test('user serialization never exposes password hashes', () => {
  const user = new User({
    name: 'Campus User',
    email: 'user@example.edu',
    password: 'stored-hash',
    role: 'student'
  });
  const serialized = user.toJSON();
  assert.equal(serialized.password, undefined);
  assert.equal(User.schema.path('password').options.select, false);
});

test('role middleware distinguishes allowed and denied roles', async () => {
  const middleware = allowRoles('admin');
  const denied = await new Promise((resolve) => middleware(
    { user: { role: 'student' } },
    {},
    (error) => resolve(error)
  ));
  assert.equal(denied.status, 403);
  const allowed = await new Promise((resolve) => middleware(
    { user: { role: 'admin' } },
    {},
    (error) => resolve(error)
  ));
  assert.equal(allowed, undefined);
});
