require('dotenv').config();
const request = require('supertest');
const TestInitializer = require('../../utils/TestInitializer');
const MockCreator = require('../../utils/MockCreator');

describe('ARTICLES LIKE ROUTER', () => {
  let server;
  let user;

  beforeAll(async () => {
    server = await TestInitializer.initializeServer();
  });

  afterAll(async () => {
    await TestInitializer.close(server);
  });

  beforeAll(async () => {
    article = await MockCreator.createArticleMock('Lorem');
    user = await MockCreator.createUserMock('Chandler');
  });

  describe('POST /api/articles/:slug/favorite', () => {
    it('should like the article', async () => {
      const response = await request(server)
          .post(`/api/articles/${article.title}/favorite`)
          .set('x-access-token', user.token);

      expect(response.statusCode).toBe(200);
      expect(response.body.article.title).toBe('Lorem');
      expect(response.body.article.favorited).toBe(true);
    });

    it('shouldn\'t fail even if the article is already liked', async () => {
      const response = await request(server)
          .post(`/api/articles/${article.title}/favorite`)
          .set('x-access-token', user.token);

      expect(response.statusCode).toBe(200);
    });

    it('should fail, because the token is invalid', async () => {
      const response = await request(server).post(`/api/articles/${article.title}/favorite`);

      expect(response.statusCode).toBe(400);
    });

    it('should fail, because no article is found', async () => {
      const response = await request(server)
          .post('/api/articles/UNKNOWN/favorite')
          .set('x-access-token', user.token);

      expect(response.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/articles/:slug/favorite', () => {
    it('should dislike the article', async () => {
      const response = await request(server)
          .delete(`/api/articles/${article.title}/favorite`)
          .set('x-access-token', user.token);

      expect(response.statusCode).toBe(200);
      expect(response.body.article.title).toBe('Lorem');
      expect(response.body.article.favorited).toBe(false);
    });

    it('shouldn\'t fail even if the article is already disliked', async () => {
      const response = await request(server)
          .delete(`/api/articles/${article.title}/favorite`)
          .set('x-access-token', user.token);

      expect(response.statusCode).toBe(200);
    });

    it('should fail, because no token is provided', async () => {
      const response = await request(server).delete(`/api/articles/${article.title}/favorite`);

      expect(response.statusCode).toBe(400);
    });

    it('should fail, because no article is found', async () => {
      const response = await request(server)
          .delete('/api/articles/UNKNOWN/favorite')
          .set('x-access-token', user.token);

      expect(response.statusCode).toBe(404);
    });
  });
});
