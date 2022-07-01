const request = require('supertest');
const MockCreator = require('../../utils/mocks/index');
const TestInitializer = require('../../utils/TestInitializer');

describe('ARTICLES CRUD ROUTER', () => {
  let server;
  let body;
  let user;
  let articleTitle = 'Lorem';

  beforeAll(async () => {
    server = await TestInitializer.initializeServer();
  });

  afterAll(async () => {
    await TestInitializer.clearDB();
    await TestInitializer.closeServer();
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
    user = await MockCreator.createUserMock('Ross');
  });

  describe('POST /api/articles', () => {
    it('should create an article', async () => {
      const response = await request(server)
          .post('/api/articles')
          .send(body)
          .set('x-access-token', user.token);

      expect(response.statusCode).toBe(200);
      expect(response.body.article.title).toBe(articleTitle);
      expect(response.body.article.author.id).toBe(`${user.id}`);
    });

    it('should fail because no token is provided', async () => {
      const response = await request(server).post('/api/articles').send(body);

      expect(response.statusCode).toBe(400);
    });

    it('should fail because the article\'s title is not unique', async () => {
      await MockCreator.createArticleMock(articleTitle, user.id);

      const response = await request(server)
          .post('/api/articles')
          .send(body)
          .set('x-access-token', user.token);

      expect(response.statusCode).toBe(400);
    });
  });

  describe('PUT /api/articles/:slug', () => {
    it('should update the article, ignoring unnecessary fileds', async () => {
      const body = {
        article: {
          title: 'Ipsum',
          description: 'Dolor sit amet!',
          propToBeIgnored: 'ignore me',
        },
      };
      const response = await request(server)
          .put(`/api/articles/${articleTitle}`)
          .send(body)
          .set('x-access-token', user.token);

      const {title, description, propToBeIgnored} = response.body.article;
      articleTitle = title;

      expect(response.statusCode).toBe(200);
      expect(title).toBe('Ipsum');
      expect(description).toBe('Dolor sit amet!');
      expect(propToBeIgnored).toBeUndefined();
    });

    it('should fail because no token is provided', async () => {
      const response = await request(server).put(`/api/articles/${articleTitle}`).send(body);

      expect(response.statusCode).toBe(400);
    });

    it('should fail because no article is found', async () => {
      body.article.title = 'new title';
      const response = await request(server)
          .put('/api/articles/UNKNOWN')
          .send(body)
          .set('x-access-token', user.token);

      expect(response.statusCode).toBe(404);
    });
  });

  describe('GET /api/articles/:slug', () => {
    let articleId;
    it('should get the article, favorited: false because the article isn\'t liked', async () => {
      const response = await request(server)
          .get(`/api/articles/${articleTitle}`)
          .set('x-access-token', user.token);

      articleId = response.body.article._id;

      expect(response.statusCode).toBe(200);
      expect(response.body.article.title).toBe('Ipsum');
      expect(response.body.article.description).toBe('Dolor sit amet!');
    });

    it('should get the article, favorited: true because the article is liked', async () => {
      await request(server)
          .post(`/api/articles/${articleTitle}/favorite`)
          .set('x-access-token', user.token);

      const response = await request(server)
          .get(`/api/articles/${articleTitle}`)
          .set('x-access-token', user.token);

      expect(response.statusCode).toBe(200);
      expect(response.body.article._id).toEqual(articleId);
      expect(response.body.article.favorited).toBe(true);
    });

    it('should get the article, favorited: false because no token is provided', async () => {
      const response = await request(server).get(`/api/articles/${articleTitle}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.article._id).toBe(articleId);
      expect(response.body.article.favorited).toBe(false);
    });

    it('should fail because no article is found', async () => {
      const response = await request(server).get('/api/articles/UNKNOWN');

      expect(response.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/articles/:slug', () => {
    it('should fail because no token is provided', async () => {
      const response = await request(server).delete(`/api/articles/${articleTitle}`);

      expect(response.statusCode).toBe(400);
    });

    it('should fail because the article does not exist', async () => {
      const response = await request(server)
          .delete('/api/articles/UNKNOWN')
          .set('x-access-token', user.token);

      expect(response.statusCode).toBe(400);
    });

    it('should delete the article', async () => {
      const response = await request(server)
          .delete(`/api/articles/${articleTitle}`)
          .set('x-access-token', user.token);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({});
    });
  });
});
