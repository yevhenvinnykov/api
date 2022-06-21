require('dotenv').config();
const ArticlesDBService = require('./articles-db.service');

describe('ARTICLES DB SERVICE', () => {
  test('should be created', () => {
    const service = ArticlesDBService;
    expect(service).toBeTruthy();
  });
});
