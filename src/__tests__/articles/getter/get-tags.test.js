const request = require('supertest');
const mongoose = require('mongoose');
const Article = require('../../../db/models/article.model');
const app = require('../../index');

describe('ARTICLES GETTER ROUTER: GET TAGS', () => {
  let server;

  beforeAll(async () => {
    await Article.deleteMany({});
    server = app.listen(3006);
  });

  afterAll(async () => {
    await Article.deleteMany({});
    await mongoose.connection.close();
    await server.close();
  });

  it('should have a module', () => {
    expect(Article).toBeDefined();
    expect(app).toBeDefined();
  });

  beforeAll(async () => {
    const articlesTitles = [
      'ArticleOne',
      'ArticleTwo',
      'ArticleThree',
      'ArticleFour',
      'ArticleFive',
    ];
    for (const title of articlesTitles) {
      const article = new Article({
        title: title,
        description: 'Lorem ipsum',
        body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
        tagList: ['tag'],
      });
      article.slug = article.title;
      await article.save();
    }
  });

  describe('GET /api/tags', () => {
    it('should return tags', async () => {
      const response = await request(server)
          .get('/api/tags')
          .set('Accept', 'application/json');

      expect(response.statusCode).toBe(200);
      expect(response.body.tags.length).toBe(1);
      expect(response.body.tags).toEqual(['tag']);
    });
  });
});
