const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../../db/models/user.model');
const Article = require('../../db/models/article.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = require('../index');

describe('ARTICLES CRUD ROUTER', () => {
  let server;
  let body;
  let user;
  let token;

  beforeAll(async () => {
    await Article.deleteMany({});
    await User.deleteMany({});
    server = app.listen(3005);
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

  beforeAll(() => {
    body = {
      article: {
        title: 'Lorem',
        description: 'Lorem ipsum',
        body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
        tagList: ['lorem'],
      },
    };
  });

  beforeAll(async () => {
    process.env.JWT_SECRET = 'secret';
    // Have no idea why, but it won't work without setting the env variable
    user = await new User({
      username: 'Ross',
      email: 'ross@email.com',
      password: bcrypt.hashSync('Pivot1', 8),
    });
    token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: 3600});
    user.token = token;
    await user.save();
  });

  describe('POST /api/articles', () => {
    it('should create an article', async () => {
      const response = await request(server)
          .post('/api/articles')
          .send(body)
          .set('x-access-token', token)
          .set('Accept', 'application/json');

      expect(response.statusCode).toBe(200);
      expect(response.body.article.title).toBe('Lorem');
      expect(response.body.article.author).toBe(user.id);
      expect(response.body.article._id).toBeTruthy();
    });

    it('should fail because no token is provided', async () => {
      const response = await request(server)
          .post('/api/articles')
          .send(body)
          .set('Accept', 'application/json');

      expect(response.statusCode).toBe(400);
    });

    it('should fail because the article\'s title is not unique', async () => {
      new Article({
        title: 'Lorem',
        description: 'Lorem ipsum',
        body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
        tagList: ['lorem'],
      }).save();

      const response = await request(server)
          .post('/api/articles')
          .send(body)
          .set('x-access-token', token)
          .set('Accept', 'application/json');

      expect(response.statusCode).toBe(400);
    });
  });

  describe('PUT /api/articles/:slug', () => {
    it('should update the article', async () => {
      const body = {
        article: {
          title: 'Ipsum',
          description: 'Dolor sit amet!',
          propToBeIgnored: 'ignore me',
        },
      };
      const response = await request(server)
          .put('/api/articles/Lorem')
          .send(body)
          .set('x-access-token', token)
          .set('Accept', 'application/json');

      expect(response.statusCode).toBe(200);
      expect(response.body.article.title).toBe('Ipsum');
      expect(response.body.article.description).toBe('Dolor sit amet!');
      expect(response.body.article.propToBeIgnored).toBeUndefined();
    });

    it('should fail because no token is provided', async () => {
      const response = await request(server)
          .put('/api/articles/Lorem')
          .send(body)
          .set('Accept', 'application/json');

      expect(response.statusCode).toBe(400);
    });

    it('should fail because no article is found', async () => {
      body.article.title = 'new title';
      const response = await request(server)
          .put('/api/articles/Unknown')
          .send(body)
          .set('x-access-token', token)
          .set('Accept', 'application/json');

      expect(response.statusCode).toBe(404);
    });
  });

  describe('GET /api/articles/:slug', () => {
    let articleId;
    it('should get the article, favorited: false because the article isn\'t liked', async () => {
      const response = await request(server)
          .get('/api/articles/Ipsum')
          .set('x-access-token', token)
          .set('Accept', 'application/json');

      articleId = response.body.article._id;
      expect(response.statusCode).toBe(200);
      expect(response.body.article.title).toBe('Ipsum');
      expect(response.body.article.description).toBe('Dolor sit amet!');
    });

    it('should get the article, favorited: true because the article is liked', async () => {
      user.favorites.push(articleId);
      await user.save();
      const response = await request(server)
          .get('/api/articles/Ipsum')
          .set('x-access-token', token)
          .set('Accept', 'application/json');

      expect(response.statusCode).toBe(200);
      expect(response.body.article._id).toBe(articleId);
      expect(response.body.article.favorited).toBe(true);
    });

    it('should get the article, favorited: false because no token is provided', async () => {
      const response = await request(server)
          .get('/api/articles/Ipsum')
          .set('Accept', 'application/json');

      expect(response.statusCode).toBe(200);
      expect(response.body.article._id).toBe(articleId);
      expect(response.body.article.favorited).toBe(false);
    });

    it('should fail because no article is found', async () => {
      const response = await request(server)
          .get('/api/articles/Unknown')
          .set('Accept', 'application/json');

      expect(response.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/articles/:slug', () => {
    it('should fail because no token is provided', async () => {
      const response = await request(server)
          .delete('/api/articles/Ipsum')
          .set('Accept', 'application/json');

      expect(response.statusCode).toBe(400);
    });

    it('should fail because the article does not exist', async () => {
      const response = await request(server)
          .delete('/api/articles/Unknown')
          .set('x-access-token', token)
          .set('Accept', 'application/json');

      expect(response.statusCode).toBe(400);
    });

    it('should delete the article', async () => {
      const response = await request(server)
          .delete('/api/articles/Ipsum')
          .set('x-access-token', token)
          .set('Accept', 'application/json');

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({});
    });
  });
});
