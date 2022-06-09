const ArticlesService = require('./articles.service');
const ArticlesRepository = require('../../db/articles.repository');
const UsersRepository = require('../../db/users.repository');
const {BadRequestError} = require('../../middleware/errors/errorHandler');

describe('ARTICLES SERVICE', () => {
  describe('CREATE ARTICLE', () => {
    let mockData;
    beforeEach(() => {
      mockData = {
        authUserId: 1,
        articleData: {title: 'title'},
      };
    });

    test('should create an article', async () => {
      jest.spyOn(ArticlesRepository, 'create')
          .mockReturnValue({article: 'article'});
      const article = await ArticlesService
          .createArticle(mockData);
      expect(article).toEqual({article: 'article'});
    });

    test('should throw an error if the article is not created', async () => {
      jest.spyOn(ArticlesRepository, 'create').mockReturnValue(null);
      try {
        await ArticlesService.createArticle(mockData);
      } catch (error) {
        expect(error.message)
            .toBe('Something went wrong when creating article');
      }
    });
  });

  describe('UPDATE ARTICLE', () => {
    let mockData;
    beforeEach(() => {
      mockData = {
        slug: 'slug',
        authUserId: 1,
        articleData: {title: 'updated'},
      };
    });

    test('should update an article', async () => {
      jest.spyOn(ArticlesRepository, 'findOneBy')
          .mockReturnValue({title: 'title', author: {equals: () => true}});
      jest.spyOn(ArticlesRepository, 'update')
          .mockReturnValue({title: 'updated'});
      const article = await ArticlesService.updateArticle(mockData);
      expect(article).toEqual({title: 'updated'});
    });

    test('should throw an error if auth user is not the author', async () => {
      jest.spyOn(ArticlesRepository, 'findOneBy')
          .mockReturnValue({title: 'title', author: {equals: () => false}});
      try {
        await ArticlesService.updateArticle(mockData);
      } catch (error) {
        expect(error.message)
            .toBe('You are not authorized to update the article');
      }
    });
  });

  describe('GET ARTICLE', () => {
    let expectedData;

    beforeEach(() => {
      expectedData = {
        title: 'title',
        author: {following: false, _id: 1},
        favorited: false,
      };
    });

    beforeEach(() => {
      const mockArticle = {title: 'title', author: {_id: 1}};
      jest.spyOn(ArticlesRepository, 'findOneBy').mockReturnValue(mockArticle);
    });

    test('should get the article and add to it favorited&followed info',
        async () => {
          jest.spyOn(UsersRepository, 'findOneBy').mockReturnValue({
            following: [{equals: () => true}],
            favorites: [{equals: () => false}],
          });
          const article = await ArticlesService
              .getArticle({slug: 'slug', authUserId: '1'});
          expectedData.author.following = true;
          expect(article).toEqual(expectedData);
        });

    test(`should get the article and add favorited&followed: false
          because no authUserId provided`,
    async () => {
      const article = await ArticlesService
          .getArticle({slug: 'slug', authUserId: null});
      expect(article).toEqual(expectedData);
    });

    test('should throw an error if no article found', async () => {
      jest.spyOn(ArticlesRepository, 'findOneBy').mockReturnValue(null);
      try {
        await ArticlesService.getArticle({slug: 'slug', authUserId: 1});
      } catch (error) {
        expect(error.message).toBe('Article not found');
      }
    });
  });

  describe('DELETE ARTICLE', () => {
    test('should delete an article', async () => {
      jest.spyOn(ArticlesRepository, 'delete')
          .mockReturnValue({deletedCount: 1});
      const fn = async () => await ArticlesService
          .deleteArticle({slug: 'slug', authUserId: 1});
      expect(fn).not.toThrow(BadRequestError);
    });

    test('should throw an error if article wasn\'t deleted', async () => {
      try {
        jest.spyOn(ArticlesRepository, 'delete')
            .mockReturnValue({deletedCount: 0});
        await ArticlesService.deleteArticle({slug: 'slug', authUserId: 1});
      } catch (error) {
        expect(error.message)
            .toBe('Article not found or you\'re not authorized');
      }
    });
  });

  describe('LIKE ARTICLE', () => {
    const mockArticle = {
      _doc: {
        title: 'title',
      },
      save: () => {},
    };
    const expectedData = {title: 'title', favorited: true};

    beforeEach(() => {
      jest.spyOn(ArticlesRepository, 'findOneBy').mockReturnValue(mockArticle);
    });

    test('should mutate the article and the authUser return them', async () => {
      jest.spyOn(UsersRepository, 'findOneBy').mockReturnValue({
        favorites: [{equals: () => false}],
        save: () => {},
      });
      const article = await ArticlesService
          .likeArticle({slug: 'slug', authUserId: 1});
      expect(article).toEqual(expectedData);
    });

    test('should add favorited: true', async () => {
      jest.spyOn(UsersRepository, 'findOneBy').mockReturnValue({
        favorites: [{equals: () => true}],
      });
      const article = await ArticlesService
          .likeArticle({slug: 'slug', authUserId: 1});
      expect(article).toEqual(expectedData);
    });
  });

  describe('DISLIKE ARTICLE', () => {
    const mockArticle = {
      _id: 1,
      _doc: {
        title: 'title',
      },
      save: () => {},
    };
    const expectedData = {title: 'title', favorited: false};

    beforeEach(() => {
      jest.spyOn(ArticlesRepository, 'findOneBy').mockReturnValue(mockArticle);
    });

    test('should mutate the article and the authUser and return them',
        async () => {
          jest.spyOn(UsersRepository, 'findOneBy').mockReturnValue({
            favorites: [1],
            save: () => {},
          });
          const article = await ArticlesService
              .dislikeArticle({slug: 'slug', authUserId: 1});
          expect(article).toEqual(expectedData);
        });

    test('should add favorited: false', async () => {
      jest.spyOn(UsersRepository, 'findOneBy').mockReturnValue({
        favorites: [],
      });
      const article = await ArticlesService
          .dislikeArticle({slug: 'slug', authUserId: 1});
      expect(article).toEqual(expectedData);
    });
  });

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
      const articles = await ArticlesService
          .getArticlesFromFollowedUsers(1, mockQuery);
      expect(articles).toEqual(expectedData);
    });

    test('should throw an error if no authUserId found', async () => {
      try {
        jest.spyOn(UsersRepository, 'findOneBy').mockReturnValue(null);
        await ArticlesService.getArticlesFromFollowedUsers(1, mockQuery);
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
      const articles = await ArticlesService.getArticles(null, mockQuery);
      expect(articles).toEqual(expectedData);
    });

    test('should get articles, add info and return them', async () => {
      const articles = await ArticlesService.getArticles(1, mockQuery);
      expectedData.articles = [
        {title: 'title', favorited: true},
        {title: 'another title', favorited: false},
      ];
      expect(articles).toEqual(expectedData);
    });

    test('should throw an error if no articles are found', async () => {
      jest.spyOn(ArticlesRepository, 'find').mockReturnValue(null);
      try {
        await ArticlesService.getArticles(1, mockQuery);
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
      const tags = await ArticlesService.getTags();
      expect(tags).toEqual(expectedData);
    });
  });
});
