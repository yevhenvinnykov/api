const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../../db/models/user.model');
const Comment = require('../../db/models/comment.model');
const Article = require('../../db/models/article.model');
const jwt = require('jsonwebtoken');
const app = require('../index');
const bcrypt = require('bcryptjs');

describe('COMMENTS ROUTER', () => {
  let server;
  let user;
  let token;
  let article;

  beforeAll(async () => {
    await User.deleteMany({});
    await Article.deleteMany({});
    await Comment.deleteMany({});
    server = app.listen(3003);
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Article.deleteMany({});
    await Comment.deleteMany({});
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Article.deleteMany({});
    await Comment.deleteMany({});
    await mongoose.connection.close();
    await server.close();
  });

  it('should have a module', () => {
    expect(User).toBeDefined();
    expect(Comment).toBeDefined();
    expect(Article).toBeDefined();
    expect(app).toBeDefined();
  });

  beforeEach(async () => {
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

  beforeEach(async () => {
    article = await new Article({
      title: 'Lorem',
      description: 'Lorem ipsum',
      body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
      tagList: ['lorem'],
    });
    article.slug = article.title;
    await article.save();
  });

  describe('POST /api/articles/:slug/comments', () => {
    it('should create a comment', async () => {
      const body = {
        comment: {body: 'Test comment'},
      };
      const response = await request(server)
          .post(`/api/articles/${article.slug}/comments`)
          .send(body)
          .set('Accept', 'application/json')
          .set('x-access-token', token);

      expect(response.statusCode).toBe(200);
      expect(response.body.comment.body).toBe('Test comment');
      expect(response.body.comment.author).toBe(user.id);
      expect(response.body.comment.article).toBe(article.id);
    });
  });

  it('should fail because no article is found', async () => {
    const body = {
      comment: {body: 'Test comment'},
    };
    const response = await request(server)
        .post('/api/articles/Unknown/comments')
        .send(body)
        .set('Accept', 'application/json')
        .set('x-access-token', token);

    expect(response.statusCode).toBe(404);
  });

  it('should fail because no token is provided', async () => {
    const body = {
      comment: {body: 'Test comment'},
    };
    const response = await request(server)
        .post('/api/articles/Unknown/comments')
        .send(body)
        .set('Accept', 'application/json');

    expect(response.statusCode).toBe(400);
  });

  describe('GET /api/articles/:slug/comments', () => {
    it('should return comments', async () => {
      const comments = ['TEST 1', 'TEST 2', 'TEST 3'];
      comments.forEach(async (comment) => {
        await new Comment({
          body: comment,
          author: user.id,
          article: article.id,
        }).save();
      });
      const response = await request(server)
          .get(`/api/articles/${article.slug}/comments`)
          .set('Accept', 'application/json');

      expect(response.statusCode).toBe(200);
      expect(response.body.comments.length).toBe(3);
      expect(response.body.comments[0].body).toEqual('TEST 1');
    });
  });

  describe('DELETE /api/articles/:slug/comments/:id', () => {
    let comment;

    beforeEach(async () => {
      comment = await new Comment({
        body: 'TEST',
        author: user.id,
        article: article.id,
      }).save();
    });

    it('should delete a comment', async () => {
      const response = await request(server)
          .delete(`/api/articles/${article.slug}/comments/${comment.id}`)
          .set('x-access-token', token)
          .set('Accept', 'application/json');

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({});
    });

    it('should fail because no token is provided', async () => {
      const response = await request(server)
          .delete(`/api/articles/${article.slug}/comments/${comment.id}`)
          .set('Accept', 'application/json');

      expect(response.statusCode).toBe(400);
    });

    it('should fail because no comment is found', async () => {
      const response = await request(server)
          .delete(`/api/articles/${article.slug}/comments/${new mongoose.Types.ObjectId()}`)
          .set('x-access-token', token)
          .set('Accept', 'application/json');

      expect(response.statusCode).toBe(404);
    });
  });
});


