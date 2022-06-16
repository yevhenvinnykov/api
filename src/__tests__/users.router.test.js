const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const app = require('./index');

const MockCreator = require('./utils/MockCreator');
const cleanUpDB = require('./utils/cleanUpDB');

describe('USERS ROUTER', () => {
  let server;

  beforeAll(async () => {
    await cleanUpDB();
    server = app.listen(3001);
  });

  afterAll(async () => {
    await cleanUpDB();
    await mongoose.connection.close();
    await server.close();
  });

  describe('POST /api/users/signup', () => {
    let body;

    beforeEach(() => {
      body = {
        user: {
          username: 'John',
          email: 'john@email.com',
          password: 'JohnPassword1',
        },
      };
    });

    it('should create a user and return the user object with a token', async () => {
      const response = await request(server).post('/api/users/signup').send(body);

      expect(response.statusCode).toBe(200);
      expect(response.body.user.username).toBe('John');
      expect(response.body.user.token).toBeTruthy();
    });

    it('should fail because the password won\'t pass the validation', async () => {
      body.user.password = 'invld';
      const response = await request(server).post('/api/users/signup').send(body);

      expect(response.statusCode).toBe(400);
    });
  });

  it('should fail because no email was provided', async () => {
    body = {user: {username: 'username', password: 'Password1'}};
    const response = await request(server).post('/api/users/signup').send(body);

    expect(response.statusCode).toBe(500);
  });

  it('should fail because the email is invalid', async () => {
    body.user.email = '!!1=+invalidemail';
    const response = await request(server).post('/api/users/signup').send(body);

    expect(response.statusCode).toBe(400);
  });

  describe('PUT /api/users', () => {
    let user;

    beforeAll(async () => {
      user = await MockCreator.createUserMock('John');
      await MockCreator.createUserMock('Jack');
    });

    it('should fail because the email is taken', async () => {
      const body = {user: {username: 'New Username', email: 'jack@email.com'}};

      const response = await request(server)
          .put('/api/users')
          .send(body)
          .set('x-access-token', user.token);

      expect(response.statusCode).toBe(400);
    });

    it('should fail because the token is invalid', async () => {
      const body = {user: {username: 'New Username'}};

      const response = await request(server)
          .put('/api/users')
          .send(body)
          .set('x-access-token', 'INVALID_TOKEN');

      expect(response.statusCode).toBe(400);
    });

    it('should fail because the token is not provided', async () => {
      const body = {user: {username: 'New Username'}};

      const response = await request(server).put('/api/users').send(body);

      expect(response.statusCode).toBe(400);
    });

    it('should update the user, ignoring unnecessary fileds', async () => {
      const body = {
        user: {
          username: 'Ross',
          propToBeIgnored: 'ignore me',
          password: 'NewPassword1',
        },
      };
      const response = await request(server)
          .put('/api/users')
          .send(body)
          .set('x-access-token', user.token);

      const {username, propToBeIgnored, password} = response.body.user;

      expect(response.statusCode).toBe(200);
      expect(username).toBe('Ross');
      expect(propToBeIgnored).toBeUndefined();
      expect(bcrypt.compareSync('NewPassword1', password)).toBe(true);
    });
  });
});
