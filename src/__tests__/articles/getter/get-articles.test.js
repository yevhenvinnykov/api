const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../../../db/models/user.model');
const Article = require('../../../db/models/article.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = require('../../index');

describe('ARTICLES GETTER ROUTER: GET ARTICLES', () => {
  let server;
  let user;
  let token;
  const articles = [];

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
        tagList: ['lorem'],
      });
      article.slug = article.title;
      await article.save();
      articles.push(article);
    }
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
    user.favorites.push(articles[0].id, articles[1].id);
    await user.save();
  });

  beforeAll(() => {
    articles.forEach(async (article) => {
      article.author = user._id;
      await article.save();
    });
  });

  describe('GET /api/articles', () => {
    it('should return all the articles since no limit is specified', async () => {
      const response = await request(server)
          .get('/api/articles')
          .set('Accept', 'application/json');
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
          .get('/api/articles?limit=1&offset=2')
          .set('Accept', 'application/json');

      expect(response.statusCode).toBe(200);
      expect(response.body.articles.length).toBe(1);
      expect(response.body.articlesCount).toBe(5);
    });

    it('all the articles should have favorited: false, no token is provided', async () => {
      const response = await request(server)
          .get('/api/articles')
          .set('Accept', 'application/json');

      expect(response.statusCode).toBe(200);
      expect(response.body.articles.every((article) => !article.favorited)).toBe(true);
    });

    it('some articles should have favorited: true, token is provided', async () => {
      const response = await request(server)
          .get('/api/articles')
          .set('x-access-token', token)
          .set('Accept', 'application/json');

      expect(response.statusCode).toBe(200);
      const likedArticles = response.body.articles.filter((article) => article.favorited);
      expect(likedArticles.length).toBe(2);
      expect(likedArticles[0].title).toBe('ArticleOne');
      expect(likedArticles[1].title).toBe('ArticleTwo');
    });

    it('should return all the articles of the given author', async () => {
      const response = await request(server)
          .get('/api/articles?author=Chandler')
          .set('x-access-token', token)
          .set('Accept', 'application/json');

      expect(response.statusCode).toBe(200);
      expect(response.body.articles.length).toBe(5);
      expect(response.body.articles.every((article) => article.author._id === user.id)).toBe(true);
    });

    it('should return all the liked articles', async () => {
      const response = await request(server)
          .get('/api/articles?favorited=Chandler')
          .set('x-access-token', token)
          .set('Accept', 'application/json');

      expect(response.statusCode).toBe(200);
      expect(response.body.articles.length).toBe(2);
      expect(response.body.articles.every((article) => article.favorited)).toBe(true);
    });

    it('should return all the articles with the given tag', async () => {
      const response = await request(server)
          .get('/api/articles?tag=lorem')
          .set('x-access-token', token)
          .set('Accept', 'application/json');

      expect(response.statusCode).toBe(200);
      expect(response.body.articles.length).toBe(5);
      expect(response.body.articles.every((article) => article.tagList.includes('lorem')))
          .toBe(true);
    });

    it('should fail because token is invalid', async () => {
      const response = await request(server)
          .get('/api/articles')
          .set('x-access-token', 'INVALID_TOKEN')
          .set('Accept', 'application/json');

      expect(response.statusCode).toBe(400);
    });
  });
});
