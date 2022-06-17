const request = require('supertest');
const TestInitializer = require('../../../utils/TestInitializer');
const MockCreator = require('../../../utils/MockCreator');

describe('ARTICLES GETTER ROUTER: GET ARTICLES', () => {
  let server;
  let user;
  const articles = [];

  beforeAll(async () => {
    server = await TestInitializer.initializeServer();
  });

  afterAll(async () => {
    await TestInitializer.close(server);
  });

  beforeAll(async () => {
    const articleNumbers = ['One', 'Two', 'Three', 'Four', 'Five'];
    for (const number of articleNumbers) {
      const article = await MockCreator.createArticleMock(`Article${number}`);
      articles.push(article);
    }
  });

  beforeAll(async () => {
    user = await MockCreator.createUserMock('Chandler');
    user.favorites.push(articles[0].id, articles[1].id);
    await user.save();
  });

  beforeAll(() => {
    articles.forEach(async (article) => {
      article.author = user.id;
      await article.save();
    });
  });

  describe('GET /api/articles', () => {
    it('should return all the articles since no limit is specified', async () => {
      const response = await request(server).get('/api/articles');

      expect(response.statusCode).toBe(200);
      expect(response.body.articles.length).toBe(5);
      expect(response.body.articlesCount).toBe(5);
    });

    it('should return specified number of articles', async () => {
      const response = await request(server)
          .get('/api/articles?limit=3')
          .set('Accept', 'application/json');

      expect(response.statusCode).toBe(200);
      expect(response.body.articles.length).toBe(3);
      expect(response.body.articlesCount).toBe(5);
    });

    it('should skip the specified number of articles', async () => {
      const response = await request(server)
          .get('/api/articles?limit=1&offset=3')
          .set('Accept', 'application/json');

      expect(response.statusCode).toBe(200);
      expect(response.body.articles.length).toBe(1);
      expect(response.body.articles[0].title).toBe('ArticleFour');
      expect(response.body.articlesCount).toBe(5);
    });

    it('all the articles should have favorited: false, no token is provided', async () => {
      const response = await request(server).get('/api/articles');

      expect(response.statusCode).toBe(200);
      expect(response.body.articles.every((article) => !article.favorited)).toBe(true);
    });

    it('two of the articles should have favorited: true, token is provided', async () => {
      const response = await request(server)
          .get('/api/articles')
          .set('x-access-token', user.token);

      expect(response.statusCode).toBe(200);
      const likedArticles = response.body.articles.filter((article) => article.favorited);
      expect(likedArticles.length).toBe(2);
    });

    it('should return all the articles of the given author', async () => {
      const response = await request(server).get(`/api/articles?author=${user.username}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.articles.length).toBe(5);
      expect(response.body.articles.every((article) => article.author.id === user.id)).toBe(true);
    });

    it('should return all the liked articles', async () => {
      const response = await request(server)
          .get(`/api/articles?favorited=${user.username}`)
          .set('x-access-token', user.token);

      expect(response.statusCode).toBe(200);
      expect(response.body.articles.length).toBe(2);
      expect(response.body.articles.every((article) => article.favorited)).toBe(true);
    });

    it('should return all the articles with the given tag', async () => {
      const response = await request(server).get('/api/articles?tag=lorem');

      const {articles} = response.body;

      expect(response.statusCode).toBe(200);
      expect(articles.length).toBe(5);
      expect(articles.every((article) => article.tagList.includes('lorem'))).toBe(true);
    });

    it('should fail because the token is invalid', async () => {
      const response = await request(server)
          .get('/api/articles')
          .set('x-access-token', 'INVALID_TOKEN');

      expect(response.statusCode).toBe(400);
    });
  });
});
