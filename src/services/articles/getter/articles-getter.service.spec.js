const ArticlesGetterService = require('./articles-getter.service');
const ArticlesRepository = require('../../../db/articles/articles.repository');
const UsersRepository = require('../../../db/users.repository');

describe('ARTICLES GETTER SERVICE', () => {
  describe('GET ARTICLES FROM FOLLOWED USERS', () => {
    const mockArticle = {
      _id: 1,
      _doc: {
        title: 'title',
      },
      save: () => {},
    };
    const mockArticles = Array(10).fill(mockArticle, 0);
    const expectedData = {
      articles: Array(5).fill({title: 'title', favorited: true}, 0),
      articlesCount: 20,
    };
    const mockQuery = {limit: null, offset: null};

    beforeEach(() => {
      jest.spyOn(ArticlesRepository, 'find').mockReturnValue(mockArticles);
      jest.spyOn(UsersRepository, 'findOneBy').mockReturnValue({
        favorites: [{equals: () => true}],
        following: [{equals: () => true}, {equals: () => true}],
        save: () => {},
      });
    });

    test('should get articles and add info to them', async () => {
      const articles = await ArticlesGetterService
          .getArticlesFromFollowedUsers(1, mockQuery);
      expect(articles).toEqual(expectedData);
    });

    test('should throw an error if no authUserId found', async () => {
      try {
        jest.spyOn(UsersRepository, 'findOneBy').mockReturnValue(null);
        await ArticlesGetterService.getArticlesFromFollowedUsers(1, mockQuery);
      } catch (error) {
        expect(error.message).toBe('User not found');
      }
    });
  });

  describe('GET ARTICLES', () => {
    const mockArticles = [
      {
        _id: 1,
        _doc: {
          title: 'title',
        },
        save: () => {},
      },
      {
        _id: 2,
        _doc: {
          title: 'another title',
        },
        save: () => {},
      },
    ];
    let expectedData;
    const mockQuery = {
      limit: 0, offset: 0, author: 'author', favorited: 'user', tag: 'tag',
    };

    beforeEach(() => {
      jest.spyOn(ArticlesRepository, 'find').mockReturnValue(mockArticles);
      jest.spyOn(UsersRepository, 'findOneBy').mockReturnValue({
        favorites: [{equals: (id) => id === 1}, {equals: (id) => id === 3}],
        following: [{equals: () => true}],
        save: () => {},
      });
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

    test('should get articles, add info and return them', async () => {
      const articles = await ArticlesGetterService.getArticles(1, mockQuery);
      expectedData.articles = [
        {title: 'title', favorited: true},
        {title: 'another title', favorited: false},
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
    const mockArticles = [{
      tagList: ['tag', 'tag'],
    }];
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
