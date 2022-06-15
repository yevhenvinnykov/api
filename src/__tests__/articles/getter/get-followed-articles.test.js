const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../../../db/models/user.model');
const Article = require('../../../db/models/article.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = require('../../index');

describe('ARTICLES GETTER ROUTER: GET ARTICLES FROM FOLLOWED USERS', () => {
  let server;
  let user;
  let token;
  let author;

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
    process.env.JWT_SECRET = 'secret';
    // Have no idea why, but it won't work without setting the env variable
    author = await new User({
      username: 'Author',
      email: 'author@email.com',
      password: bcrypt.hashSync('Author1', 8),
    });
    await author.save();
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
      article.author = author._id;
      await article.save();
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
    await user.save();
  });

  describe('GET /api/articles/feed', () => {
    it('should return 0 articles, because the user does not follow the author', async () => {
      const response = await request(server)
          .get('/api/articles/feed')
          .set('x-access-token', token)
          .set('Accept', 'application/json');

      expect(response.statusCode).toBe(200);
      expect(response.body.articles.length).toBe(0);
      expect(response.body.articlesCount).toBe(0);
    });

    it('should return 5 articles, because the user follows the author', async () => {
      user.following.push(author._id);
      await user.save();
      const response = await request(server)
          .get('/api/articles/feed')
          .set('x-access-token', token)
          .set('Accept', 'application/json');

      expect(response.statusCode).toBe(200);
      expect(response.body.articles.length).toBe(5);
      expect(response.body.articlesCount).toBe(5);
    });

    it('should fail because no token is provided', async () => {
      const response = await request(server)
          .get('/api/articles/feed')
          .set('Accept', 'application/json');

      expect(response.statusCode).toBe(400);
    });
  });
});
