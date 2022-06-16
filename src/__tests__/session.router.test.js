const request = require('supertest');
const mongoose = require('mongoose');
const app = require('./index');

const MockCreator = require('./utils/MockCreator');
const cleanUpDB = require('./utils/cleanUpDB');

describe('SESSION ROUTER', () => {
  let server;
  let user;

  beforeAll(async () => {
    await cleanUpDB();
    server = app.listen(3002);
  });

  afterAll(async () => {
    await cleanUpDB();
    await mongoose.connection.close();
    await server.close();
  });

  beforeAll(async () => {
    user = await MockCreator.createUserMock('John');
  });

  describe('POST /api/users/login', () => {
    const body = {user: {email: 'john@email.com', password: 'JohnPassword1'}};

    it('should login and return the user object with a token', async () => {
      const response = await request(server).post('/api/users/login').send(body);

      expect(response.statusCode).toBe(200);
      expect(response.body.user.username).toBe('John');
      expect(response.body.user.token).toBe(user.token);
    });

    it('should fail because the password is invalid', async () => {
      body.user.password = 'InvalidPassword1';
      const response = await request(server).post('/api/users/login').send(body);

      expect(response.statusCode).toBe(400);
    });

    it('should fail because the user does not exist', async () => {
      body.user.email = 'doesntexist@email.com';
      const response = await request(server).post('/api/users/login').send(body);

      expect(response.statusCode).toBe(404);
    });
  });

  describe('GET /api/users', () => {
    it('should return a logged-in user object with a token ', async () => {
      const response = await request(server)
          .get('/api/users')
          .set('x-access-token', user.token);

      expect(response.statusCode).toBe(200);
      expect(response.body.user.username).toBe('John');
      expect(response.body.user.token).toBe(user.token);
    });
  });

  it('should fail because the token is invalid', async () => {
    const response = await request(server)
        .get('/api/users')
        .set('x-access-token', 'INVALID_TOKEN');

    expect(response.statusCode).toBe(400);
  });

  it('should fail because the token is not provided', async () => {
    const response = await request(server).get('/api/users');

    expect(response.statusCode).toBe(400);
  });
});

