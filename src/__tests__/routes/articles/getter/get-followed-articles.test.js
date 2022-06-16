const request = require('supertest');
const TestInitializer = require('../../../utils/TestInitializer');
const MockCreator = require('../../../utils/MockCreator');


describe('ARTICLES GETTER ROUTER: GET ARTICLES FROM FOLLOWED USERS', () => {
  let server;
  let user;
  let author;

  beforeAll(async () => {
    server = await TestInitializer.initializeServer();
  });

  afterAll(async () => {
    await TestInitializer.close(server);
  });

  beforeAll(async () => {
    author = await MockCreator.createUserMock('Rachel');
    user = await MockCreator.createUserMock('Chandler');
  });

  beforeAll(async () => {
    const articleNumbers = ['One', 'Two', 'Three', 'Four', 'Five'];
    for (const number of articleNumbers) {
      const article = await MockCreator.createArticleMock(`Article${number}`);
      article.author = author._id;
      await article.save();
    }
  });

  describe('GET /api/articles/feed', () => {
    it('should return 0 articles, because the user does not follow the author', async () => {
      const response = await request(server)
          .get('/api/articles/feed')
          .set('x-access-token', user.token);

      expect(response.statusCode).toBe(200);
      expect(response.body.articles.length).toBe(0);
      expect(response.body.articlesCount).toBe(0);
    });

    it('should return 5 articles, because the user follows the author', async () => {
      user.following.push(author._id);
      await user.save();
      const response = await request(server)
          .get('/api/articles/feed')
          .set('x-access-token', user.token);

      expect(response.statusCode).toBe(200);
      expect(response.body.articles.length).toBe(5);
      expect(response.body.articlesCount).toBe(5);
    });

    it('should fail because no token is provided', async () => {
      const response = await request(server).get('/api/articles/feed');

      expect(response.statusCode).toBe(400);
    });
  });
});
