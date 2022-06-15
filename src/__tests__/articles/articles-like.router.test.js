const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../../db/models/user.model');
const Article = require('../../db/models/article.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = require('../index');

describe('ARTICLES LIKE ROUTER', () => {
  let server;
  let user;
  let token;

  beforeAll(async () => {
    await Article.deleteMany({});
    await User.deleteMany({});
    server = app.listen(3006);
  });

  afterAll(async () => {
    await Article.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
    await server.close();
  });

  it('should have a module', () => {
    expect(User).toBeDefined();
    expect(Article).toBeDefined();
    expect(app).toBeDefined();
  });

  beforeAll(async () => {
    article = new Article({
      title: 'Lorem',
      description: 'Lorem ipsum',
      body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
      tagList: ['lorem'],
    });
    article.slug = article.title;
    await article.save();
  });

  beforeAll(async () => {
    process.env.JWT_SECRET = 'secret';
    // Have no idea why, but it won't work without setting the env variable
    user = await new User({
      username: 'Chandler',
      email: 'chandler@email.com',
      password: bcrypt.hashSync('Chandler1', 8),
    });
    token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: 3600});
    user.token = token;
    await user.save();
  });

  describe('POST /api/articles/:slug/favorite', () => {
    it('should like the article', async () => {
      const response = await request(server)
          .post('/api/articles/Lorem/favorite')
          .set('x-access-token', token)
          .set('Accept', 'application/json');

      expect(response.statusCode).toBe(200);
      expect(response.body.article.title).toBe('Lorem');
      expect(response.body.article.favorited).toBe(true);
    });

    it('should fail, because the token is invalid', async () => {
      const response = await request(server)
          .post('/api/articles/Lorem/favorite')
          .set('Accept', 'application/json');

      expect(response.statusCode).toBe(400);
    });

    it('should fail, because no article is found', async () => {
      const response = await request(server)
          .post('/api/articles/Unknown/favorite')
          .set('x-access-token', token)
          .set('Accept', 'application/json');

      expect(response.statusCode).toBe(404);
    });

    it('shouldn\'t fail even if the article is already liked', async () => {
      user.favorites.push(article._id);
      await user.save();
      const response = await request(server)
          .post('/api/articles/Lorem/favorite')
          .set('x-access-token', token)
          .set('Accept', 'application/json');

      expect(response.statusCode).toBe(200);
      expect(response.body.article.title).toBe('Lorem');
      expect(response.body.article.favorited).toBe(true);
    });
  });

  describe('DELETE /api/articles/:slug/favorite', () => {
    it('should dislike the article', async () => {
      const response = await request(server)
          .delete('/api/articles/Lorem/favorite')
          .set('x-access-token', token)
          .set('Accept', 'application/json');

      expect(response.statusCode).toBe(200);
      expect(response.body.article.title).toBe('Lorem');
      expect(response.body.article.favorited).toBe(false);
    });

    it('should fail, because no token is provided', async () => {
      const response = await request(server)
          .delete('/api/articles/Lorem/favorite')
          .set('Accept', 'application/json');

      expect(response.statusCode).toBe(400);
    });

    it('should fail, because no article is found', async () => {
      const response = await request(server)
          .delete('/api/articles/Unknown/favorite')
          .set('x-access-token', token)
          .set('Accept', 'application/json');

      expect(response.statusCode).toBe(404);
    });

    it('shouldn\'t fail even if the article is already disliked', async () => {
      user.favorites = [];
      await user.save();
      const response = await request(server)
          .delete('/api/articles/Lorem/favorite')
          .set('x-access-token', token)
          .set('Accept', 'application/json');

      expect(response.statusCode).toBe(200);
      expect(response.body.article.title).toBe('Lorem');
      expect(response.body.article.favorited).toBe(false);
    });
  });
});
