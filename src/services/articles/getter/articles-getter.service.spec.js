const ArticlesGetterService = require('./articles-getter.service');
const ArticlesRepository = require('../../../db/repos/articles/articles.repository');
const UsersRepository = require('../../../db/repos/users/users.repository');

describe('ARTICLES GETTER SERVICE', () => {
  describe('GET ARTICLES FROM FOLLOWED USERS', () => {
    const mockArticles = Array(5).fill({id: 1, title: 'title'}, 0);

    const expectedData = {
      articles: mockArticles.map((article) => ({...article, favorited: true})),
      articlesCount: 5,
    };

    const mockQuery = {limit: null, offset: null, feedFor: 1};

    test('should get articles and add favorited: true', async () => {
      jest.spyOn(UsersRepository, 'findOneBy').mockReturnValue({
        favorites: [1],
        following: [1, 2],
      });
      jest.spyOn(ArticlesRepository, 'find').mockReturnValue(mockArticles);
      jest.spyOn(ArticlesRepository, 'count').mockReturnValue(5);

      const {
        articles,
        articlesCount,
      } = await ArticlesGetterService.getArticles(1, mockQuery);

      expect(articles).toEqual(expectedData.articles);
      expect(articlesCount).toBe(expectedData.articlesCount);
    });

    test('should throw an error if no authUserId found', async () => {
      try {
        jest.spyOn(UsersRepository, 'findOneBy').mockReturnValue(null);
        await ArticlesGetterService.getArticles(1, mockQuery);
      } catch (error) {
        expect(error.message).toBe('User not found');
      }
    });
  });

  describe('GET ARTICLES', () => {
    let expectedData;

    const mockArticles = [
      {id: 1, title: 'title'},
      {id: 2, title: 'another title'},
    ];

    const mockQuery = {
      limit: 0, offset: 0, author: 'author', favorited: 'user', tag: 'tag',
    };

    beforeEach(() => {
      jest.spyOn(ArticlesRepository, 'find').mockReturnValue(mockArticles);
      jest.spyOn(UsersRepository, 'findOneBy').mockReturnValue({favorites: [1, 3]});
      jest.spyOn(ArticlesRepository, 'count').mockReturnValue(1);
    });

    beforeEach(() => {
      expectedData = {
        articles: mockArticles,
        articlesCount: 1,
      };
    });

    test('should return articles', async () => {
      const articles = await ArticlesGetterService.getArticles(null, mockQuery);
      expect(articles).toEqual(expectedData);
    });

    test('should get articles and add favorited info', async () => {
      const articles = await ArticlesGetterService.getArticles(1, mockQuery);

      expectedData.articles = [
        {id: 1, title: 'title', favorited: true},
        {id: 2, title: 'another title', favorited: false},
      ];

      expect(articles).toEqual(expectedData);
    });

    test('should throw an error if no articles are found', async () => {
      jest.spyOn(ArticlesRepository, 'find').mockReturnValue(null);
      try {
        await ArticlesGetterService.getArticles(1, mockQuery);
      } catch (error) {
        expect(error.message).toBe('Articles not found');
      }
    });
  });

  describe('GET TAGS', () => {
    const mockArticles = [{tagList: ['tag', 'tag']}];
    const expectedData = ['tag'];

    beforeEach(() => {
      jest.spyOn(ArticlesRepository, 'find').mockReturnValue(mockArticles);
      jest.spyOn(ArticlesRepository, 'count').mockReturnValue(1);
    });

    test('should return tags', async () => {
      const tags = await ArticlesGetterService.getTags();
      expect(tags).toEqual(expectedData);
    });
  });
});
