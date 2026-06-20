const request = require('supertest');
const createApp = require('../src/app');

jest.mock('../src/models/user');
jest.mock('../src/services/finnhub');

const User = require('../src/models/user');

let app;

beforeAll(() => {
  app = createApp();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('POST /api/signup', () => {
  it('creates a user and redirects to dashboard', async () => {
    User.create.mockResolvedValue({ id: 1, name: 'Alice', email: 'alice@test.com' });

    const res = await request(app)
      .post('/api/signup')
      .send({ name: 'Alice', email: 'alice@test.com', password: 'password123' });

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/dashboard');
    expect(User.create).toHaveBeenCalledWith('Alice', 'alice@test.com', 'password123');
  });

  it('returns 400 when name is missing', async () => {
    const res = await request(app)
      .post('/api/signup')
      .send({ email: 'alice@test.com', password: 'password123' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('All fields are required');
  });

  it('returns 400 when email is missing', async () => {
    const res = await request(app)
      .post('/api/signup')
      .send({ name: 'Alice', password: 'password123' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('All fields are required');
  });

  it('returns 400 when password is missing', async () => {
    const res = await request(app)
      .post('/api/signup')
      .send({ name: 'Alice', email: 'alice@test.com' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('All fields are required');
  });

  it('returns 500 when User.create throws', async () => {
    User.create.mockRejectedValue(new Error('duplicate email'));

    const res = await request(app)
      .post('/api/signup')
      .send({ name: 'Alice', email: 'alice@test.com', password: 'password123' });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Internal server error');
  });
});

describe('POST /api/login', () => {
  it('logs in and redirects to dashboard', async () => {
    User.findByEmail.mockResolvedValue({ id: 1, name: 'Alice', email: 'alice@test.com', password: 'hashed' });
    User.verifyPassword.mockResolvedValue(true);

    const res = await request(app)
      .post('/api/login')
      .send({ email: 'alice@test.com', password: 'password123' });

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/dashboard');
    expect(User.findByEmail).toHaveBeenCalledWith('alice@test.com');
  });

  it('returns 400 when email is missing', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ password: 'password123' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Email and password are required');
  });

  it('returns 400 when password is missing', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ email: 'alice@test.com' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Email and password are required');
  });

  it('returns 401 when email is not found', async () => {
    User.findByEmail.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/login')
      .send({ email: 'nobody@test.com', password: 'password123' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid email or password');
  });

  it('returns 401 when password is wrong', async () => {
    User.findByEmail.mockResolvedValue({ id: 1, name: 'Alice', email: 'alice@test.com', password: 'hashed' });
    User.verifyPassword.mockResolvedValue(false);

    const res = await request(app)
      .post('/api/login')
      .send({ email: 'alice@test.com', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid email or password');
  });

  it('returns 500 when findByEmail throws', async () => {
    User.findByEmail.mockRejectedValue(new Error('db error'));

    const res = await request(app)
      .post('/api/login')
      .send({ email: 'alice@test.com', password: 'password123' });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Internal server error');
  });
});

describe('POST /api/logout', () => {
  it('destroys the session and redirects to home', async () => {
    const res = await request(app)
      .post('/api/logout');

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/');
  });

  it('clears session after login', async () => {
    User.findByEmail.mockResolvedValue({ id: 1, name: 'Alice', email: 'alice@test.com', password: 'hashed' });
    User.verifyPassword.mockResolvedValue(true);

    const agent = request.agent(app);

    await agent
      .post('/api/login')
      .send({ email: 'alice@test.com', password: 'password123' });

    await agent.post('/api/logout');

    const res = await agent
      .post('/api/quote')
      .send({ symbol: 'AAPL' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Not authenticated');
  });
});
