const request = require('supertest');
const MockCreator = require('../utils/MockCreator');
const TestInitializer = require('../utils/TestInitializer');

describe('PROFILES ROUTER', () => {
  let server;
  let user;
  let userToFollow;

  beforeAll(async () => {
    server = await TestInitializer.initializeServer();
  });

  afterAll(async () => {
    await TestInitializer.close(server);
  });

  beforeAll(async () => {
    user = await MockCreator.createUserMock('Phoebe');
    userToFollow = await MockCreator.createUserMock('Monica');
  });

  describe('POST /api/profiles/:username/follow', () => {
    it('should follow the user from params', async () => {
      const response = await request(server)
          .post(`/api/profiles/${userToFollow.username}/follow`)
          .set('x-access-token', user.token);

      expect(response.statusCode).toBe(200);
      expect(response.body.profile.username).toBe(userToFollow.username);
      expect(response.body.profile.following).toBe(true);
    });

    it('shouldn\'t fail even if the user is already followed', async () => {
      const response = await request(server)
          .post(`/api/profiles/${userToFollow.username}/follow`)
          .set('x-access-token', user.token);

      expect(response.statusCode).toBe(200);
    });

    it('should fail because the token is invalid', async () => {
      const response = await request(server)
          .post(`/api/profiles/${userToFollow.username}/follow`)
          .set('x-access-token', 'INVALID_TOKEN');

      expect(response.statusCode).toBe(400);
    });
  });

  describe('DELETE /api/profiles/:username/follow', () => {
    it('should unfollow the user from params ', async () => {
      const response = await request(server)
          .delete(`/api/profiles/${userToFollow.username}/follow`)
          .set('x-access-token', user.token);

      expect(response.statusCode).toBe(200);
      expect(response.body.profile.username).toBe(userToFollow.username);
      expect(response.body.profile.following).toBe(false);
    });

    it('shouldn\'t fail even if the user is already unfollowed', async () => {
      const response = await request(server)
          .delete(`/api/profiles/${userToFollow.username}/follow`)
          .set('x-access-token', user.token);

      expect(response.statusCode).toBe(200);
    });

    it('should fail because the token is invalid', async () => {
      const response = await request(server)
          .delete(`/api/profiles/${userToFollow.username}/follow`)
          .set('x-access-token', 'INVALID_TOKEN');

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /api/profiles/:username', () => {
    it('should return the profile of the user from params ', async () => {
      const response = await request(server)
          .get(`/api/profiles/${userToFollow.username}`)
          .set('x-access-token', user.token);

      expect(response.statusCode).toBe(200);
      expect(response.body.profile.username).toBe(userToFollow.username);
      expect(response.body.profile.following).toBe(false);
    });

    it('should fail because no profile is found', async () => {
      const response = await request(server)
          .get('/api/profiles/UNKNOWN')
          .set('x-access-token', user.token);

      expect(response.statusCode).toBe(404);
    });
  });
});

