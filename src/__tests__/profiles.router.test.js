const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../db/models/user.model');
const jwt = require('jsonwebtoken');
const app = require('./index');
const bcrypt = require('bcryptjs');

describe('PROFILES ROUTER', () => {
  let server;
  let user;
  let token;
  let userToFollow;

  beforeAll(async () => {
    await User.deleteMany({});
    server = app.listen(3003);
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
    userToFollow = await new User({
      username: 'Monica',
      email: 'monica@email.com',
      password: bcrypt.hashSync('Monica1', 8),
    });
    await userToFollow.save();
  });

  beforeEach(async () => {
    process.env.JWT_SECRET = 'secret';
    // Have no idea why, but it won't work without setting the env variable
    user = await new User({
      username: 'Phoebe',
      email: 'phoebe@email.com',
      password: bcrypt.hashSync('Phoebe1', 8),
    });
    token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: 3600});
    user.token = token;
    await user.save();
  });

  describe('POST /api/profiles/:username/follow', () => {
    it('should follow the user from params', async () => {
      const response = await request(server)
          .post('/api/profiles/Monica/follow')
          .set('x-access-token', token)
          .set('Accept', 'application/json');

      expect(response.statusCode).toBe(200);
      expect(response.body.profile.username).toBe('Monica');
      expect(response.body.profile.following).toBe(true);
    });

    it('should fail because the token is invalid', async () => {
      const response = await request(server)
          .post('/api/profiles/Monica/follow')
          .set('x-access-token', 'INVALID_TOKEN')
          .set('Accept', 'application/json');

      expect(response.statusCode).toBe(400);
    });

    it('shouldn\'t fail even if the user is already followed', async () => {
      user.following.push(userToFollow._id);
      await user.save();
      const response = await request(server)
          .post('/api/profiles/Monica/follow')
          .set('x-access-token', token)
          .set('Accept', 'application/json');

      expect(response.statusCode).toBe(200);
      expect(response.body.profile.username).toBe('Monica');
      expect(response.body.profile.following).toBe(true);
    });
  });

  describe('DELETE /api/profiles/:username/follow', () => {
    it('should unfollow the user from params ', async () => {
      user.following.push(userToFollow.id);
      await user.save();
      const response = await request(server)
          .delete('/api/profiles/Monica/follow')
          .set('Accept', 'application/json')
          .set('x-access-token', token);

      expect(response.statusCode).toBe(200);
      expect(response.body.profile.username).toBe('Monica');
      expect(response.body.profile.following).toBe(false);
    });

    it('should fail because the token is invalid', async () => {
      const response = await request(server)
          .delete('/api/profiles/Monica/follow')
          .set('x-access-token', 'INVALID_TOKEN')
          .set('Accept', 'application/json');

      expect(response.statusCode).toBe(400);
    });

    it('shouldn\'t fail even if the user is already unfollowed', async () => {
      const response = await request(server)
          .delete('/api/profiles/Monica/follow')
          .set('Accept', 'application/json')
          .set('x-access-token', token);

      expect(response.statusCode).toBe(200);
      expect(response.body.profile.username).toBe('Monica');
      expect(response.body.profile.following).toBe(false);
    });
  });

  describe('GET /api/profiles/:username', () => {
    it('should return the profile of the user from params ', async () => {
      user.following.push(userToFollow.id);
      await user.save();
      const response = await request(server)
          .get('/api/profiles/Monica')
          .set('Accept', 'application/json')
          .set('x-access-token', token);

      expect(response.statusCode).toBe(200);
      expect(response.body.profile.username).toBe('Monica');
      expect(response.body.profile.following).toBe(true);
    });

    it('should fail because no profile is found', async () => {
      const response = await request(server)
          .get('/api/profiles/Unknown')
          .set('Accept', 'application/json')
          .set('x-access-token', token);

      expect(response.statusCode).toBe(404);
    });
  });
});

