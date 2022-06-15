const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../db/models/user.model');
const jwt = require('jsonwebtoken');
const app = require('./index');
const bcrypt = require('bcryptjs');

describe('SESSION ROUTER', () => {
  let server;
  let user;
  let token;

  beforeAll(async () => {
    await User.deleteMany({});
    server = app.listen(3002);
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
    await server.close();
  });

  it('should have a module', () => {
    expect(User).toBeDefined();
    expect(app).toBeDefined();
  });

  beforeAll(async () => {
    user = await new User({
      username: 'John',
      email: 'doe@email.com',
      password: bcrypt.hashSync('password1A', 8),
    });
    token = jwt.sign({id: user._id}, 'secret', {expiresIn: 3600});
    user.token = token;
    await user.save();
  });

  describe('POST /api/users/login', () => {
    const body = {
      user: {
        email: 'doe@email.com',
        password: 'password1A',
      },
    };

    it('should login and return the user object with a token', async () => {
      const response = await request(server)
          .post('/api/users/login')
          .send(body)
          .set('Accept', 'application/json');

      expect(response.statusCode).toBe(200);
      expect(response.body.user.username).toBe('John');
      expect(response.body.user.token).toBe(token);
    });

    it('should fail because the password is invalid', async () => {
      body.user.password = 'InvalidPassword1';
      const response = await request(server)
          .post('/api/users/login')
          .send(body)
          .set('Accept', 'application/json');

      expect(response.statusCode).toBe(400);
    });

    it('should fail because the user does not exist', async () => {
      body.user.email = 'dontexist@email.com';
      const response = await request(server)
          .post('/api/users/login')
          .send(body)
          .set('Accept', 'application/json');

      expect(response.statusCode).toBe(404);
    });
  });

  describe('GET /api/users', () => {
    it('should return a logged-in user object with a token ', async () => {
      const response = await request(server)
          .get('/api/users')
          .set('Accept', 'application/json')
          .set('x-access-token', token);

      expect(response.statusCode).toBe(200);
      expect(response.body.user.username).toBe('John');
      expect(response.body.user.token).toBe(token);
    });
  });

  it('should fail because the token is invalid', async () => {
    const response = await request(server)
        .get('/api/users')
        .set('Accept', 'application/json')
        .set('x-access-token', 'INVALID_TOKEN');

    expect(response.statusCode).toBe(400);
  });

  it('should fail because the token is not provided', async () => {
    const response = await request(server)
        .get('/api/users')
        .set('Accept', 'application/json');

    expect(response.statusCode).toBe(400);
  });
});

