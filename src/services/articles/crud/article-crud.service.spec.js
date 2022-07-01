require('dotenv').config();
const ArticlesCRUDService = require('./articles-crud.service');
const ArticlesRepository = require('../../../db/repos/articles/index');
const UsersRepository = require('../../../db/repos/users/index');
const {BadRequestError} = require('../../../middleware/errors/errorHandler');

describe('ARTICLES CRUD SERVICE', () => {
  describe('CREATE ARTICLE', () => {
    let mockData;
    beforeEach(() => {
      mockData = {
        authUserId: 1,
        articleData: {title: 'title'},
      };
    });

    test('should create an article', async () => {
      jest.spyOn(ArticlesRepository, 'create').mockReturnValue({article: 'article'});

      const article = await ArticlesCRUDService.createArticle(mockData);

      expect(article).toEqual({article: 'article'});
    });

    test('should throw an error if the article is not created', async () => {
      jest.spyOn(ArticlesRepository, 'create').mockReturnValue(null);
      try {
        await ArticlesCRUDService.createArticle(mockData);
      } catch (error) {
        expect(error.message).toBe('Something went wrong when creating article');
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
          .mockReturnValue({title: 'updated', author: {id: 1}});
      jest.spyOn(ArticlesRepository, 'update').mockReturnValue({title: 'updated', author: {id: 1}});

      const article = await ArticlesCRUDService.updateArticle(mockData);
      expect(article).toEqual({title: 'updated', author: {id: 1}});
    });

    test('should throw an error if auth user is not the author', async () => {
      jest.spyOn(ArticlesRepository, 'findOneBy')
          .mockReturnValue({title: 'title', author: {id: 3}});
      try {
        await ArticlesCRUDService.updateArticle(mockData);
      } catch (error) {
        expect(error.message).toBe('You are not authorized to update the article');
      }
    });
  });

  describe('GET ARTICLE', () => {
    beforeEach(() => {
      const mockArticle = {
        id: 10,
        title: 'title',
        author: {id: 1},
      };
      jest.spyOn(ArticlesRepository, 'findOneBy').mockReturnValue(mockArticle);
    });

    test('should get the article and add to it favorited&followed info',
        async () => {
          jest.spyOn(UsersRepository, 'findOneBy').mockReturnValue({
            following: [1],
            favorites: [10],
          });
          const article = await ArticlesCRUDService.getArticle('slug', 1);

          expect(article.id).toBe(10);
          expect(article.favorited).toBe(true);
          expect(article.author.following).toBe(true);
        });

    test(`should get the article and add favorited&followed: false
          because no authUserId provided`,
    async () => {
      const article = await ArticlesCRUDService.getArticle({slug: 'slug', authUserId: null});

      expect(article.id).toBe(10);
      expect(article.favorited).toBe(false);
      expect(article.author.following).toBe(false);
    });

    test('should throw an error if no article found', async () => {
      jest.spyOn(ArticlesRepository, 'findOneBy').mockReturnValue(null);
      try {
        await ArticlesCRUDService.getArticle({slug: 'slug', authUserId: 1});
      } catch (error) {
        expect(error.message).toBe('Article not found');
      }
    });
  });

  describe('DELETE ARTICLE', () => {
    test('should delete an article', async () => {
      jest.spyOn(ArticlesRepository, 'delete').mockReturnValue({deletedCount: 1});

      const fn = async () => await ArticlesCRUDService
          .deleteArticle({slug: 'slug', authUserId: 1});

      expect(fn).not.toThrow(BadRequestError);
    });

    test('should throw an error if article wasn\'t deleted', async () => {
      jest.spyOn(ArticlesRepository, 'delete').mockReturnValue({deletedCount: 0});
      try {
        await ArticlesCRUDService.deleteArticle({slug: 'slug', authUserId: 1});
      } catch (error) {
        expect(error.message).toBe('Something went wrong whhile deleting the article');
      }
    });
  });
});
