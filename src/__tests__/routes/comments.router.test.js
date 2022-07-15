const request = require('supertest');
const MockCreator = require('../utils/mocks/index');
const TestInitializer = require('../utils/TestInitializer');
const mongoose = require('mongoose');

describe('COMMENTS ROUTER', () => {
  let server;
  let author;
  let user;
  let article;
  const body = { comment: { body: 'Test comment' } };

  beforeAll(async () => {
    server = await TestInitializer.initializeServer();
  });

  afterAll(async () => {
    await TestInitializer.clearDB();
    await TestInitializer.closeServer();
  });

  beforeAll(async () => {
    author = await MockCreator.createUserMock('John');
    user = await MockCreator.createUserMock('Jane');
    article = await MockCreator.createArticleMock('Test', author.id);
  });

  describe('POST /api/articles/:slug/comments', () => {
    it('should create a comment', async () => {
      const response = await request(server)
        .post(`/api/articles/${article.slug}/comments`)
        .send(body)
        .set('x-access-token', author.token);

      expect(response.statusCode).toBe(200);
      expect(response.body.comment.body).toBe('Test comment');
      expect(response.body.comment.author.id).toBe(`${author.id}`);
      expect(response.body.comment.article).toBe(`${article.id}`);
    });
  });

  it('should fail because no article is found', async () => {
    const response = await request(server)
      .post('/api/articles/UNKNOWN-ARTICLE/comments')
      .send(body)
      .set('x-access-token', author.token);

    expect(response.statusCode).toBe(404);
  });

  it('should fail because no token is provided', async () => {
    const response = await request(server)
      .post('/api/articles/Test/comments')
      .send(body);

    expect(response.statusCode).toBe(400);
  });

  describe('GET /api/articles/:slug/comments', () => {
    it('should return comments', async () => {
      const response = await request(server).get(
        `/api/articles/${article.slug}/comments`
      );

      expect(response.statusCode).toBe(200);
      expect(response.body.comments.length).toBe(1);
      expect(response.body.comments[0].body).toEqual('Test comment');
    });

    it('should fail because no article is found', async () => {
      const response = await request(server).get(
        `/api/articles/UNKNOWN-ARTICLE/comments`
      );

      expect(response.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/articles/:slug/comments/:id', () => {
    let comment;

    beforeEach(async () => {
      comment = await MockCreator.createCommentMock({
        body: 'TEST',
        authorId: author.id,
        articleId: article.id,
      });
    });

    it('should delete the comment', async () => {
      const response = await request(server)
        .delete(`/api/articles/${article.slug}/comments/${comment.id}`)
        .set('x-access-token', author.token);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({});
    });

    it('should fail because no token is provided', async () => {
      const response = await request(server).delete(
        `/api/articles/${article.slug}/comments/${comment.id}`
      );

      expect(response.statusCode).toBe(400);
    });

    it('should fail because no comment is found', async () => {
      const response = await request(server)
        .delete(
          `/api/articles/${
            article.slug
          }/comments/${new mongoose.Types.ObjectId()}`
        )
        .set('x-access-token', author.token);

      expect(response.statusCode).toBe(404);
    });

    it("should fail because the user is not the comment's author", async () => {
      const response = await request(server)
        .delete(`/api/articles/${article.slug}/comments/${comment.id}`)
        .set('x-access-token', user.token);

      expect(response.statusCode).toBe(400);
    });
  });
});
