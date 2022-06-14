const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../../db/models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = require('../index');

describe('USERS ROUTER', () => {
  let server;

  beforeAll(async () => {
    await User.deleteMany({});
    server = app.listen(3001);
  });

  afterEach(async () => {
    await User.deleteMany({});
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

  describe('POST /api/users/signup', () => {
    let body;
    beforeEach(() => {
      body = {
        user: {
          username: 'John',
          email: 'doe@email.com',
          password: 'password1A',
        },
      };
    });
    it('should create a user and return the user object with a token', async () => {
      const response = await request(server)
          .post('/api/users/signup')
          .send(body)
          .set('Accept', 'application/json');

      expect(response.statusCode).toBe(200);
      expect(response.body.user.username).toBe('John');
      expect(response.body.user.token).toBeTruthy();
    });

    it('should fail because the password won\'t pass the validation', async () => {
      body.user.password = 'invalidpassword';
      const response = await request(server)
          .post('/api/users/signup')
          .send(body)
          .set('Accept', 'application/json');

      expect(response.statusCode).toBe(400);
    });
  });

  describe('PUT /api/users', () => {
    let user;
    let token;
    beforeEach(async () => {
      user = await new User({
        username: 'John',
        email: 'doe@email.com',
        password: bcrypt.hashSync('password1A', 8),
      });
      token = jwt.sign({id: user._id}, 'secret', {expiresIn: 3600});
      user.token = token;
      await user.save();
    });

    it('should update the user', async () => {
      const body = {
        user: {
          username: 'Jack',
        },
      };
      const response = await request(server)
          .put('/api/users')
          .send(body)
          .set('Accept', 'application/json')
          .set('x-access-token', token);

      expect(response.statusCode).toBe(200);
      expect(response.body.user.username).toBe('Jack');
    });
  });

  it('should fail because the token is invalid', async () => {
    const body = {
      user: {
        username: 'Jack',
      },
    };
    const response = await request(server)
        .put('/api/users')
        .send(body)
        .set('Accept', 'application/json')
        .set('x-access-token', 'INVALID_TOKEN');

    expect(response.statusCode).toBe(400);
  });

  it('should fail because the token is not provided', async () => {
    const body = {
      user: {
        username: 'Jack',
      },
    };
    const response = await request(server)
        .put('/api/users')
        .send(body)
        .set('Accept', 'application/json');

    expect(response.statusCode).toBe(400);
  });
});
