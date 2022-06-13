const ArticlesCRUDService = require('./articles-crud.service');
const ArticlesRepository = require('../../../db/articles/articles.repository');
const UsersRepository = require('../../../db/users/users.repository');
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
      jest.spyOn(ArticlesRepository, 'create')
          .mockReturnValue({article: 'article'});
      const article = await ArticlesCRUDService
          .createArticle(mockData);
      expect(article).toEqual({article: 'article'});
    });

    test('should throw an error if the article is not created', async () => {
      jest.spyOn(ArticlesRepository, 'create').mockReturnValue(null);
      try {
        await ArticlesCRUDService.createArticle(mockData);
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
      const article = await ArticlesCRUDService.updateArticle(mockData);
      expect(article).toEqual({title: 'updated'});
    });

    test('should throw an error if auth user is not the author', async () => {
      jest.spyOn(ArticlesRepository, 'findOneBy')
          .mockReturnValue({title: 'title', author: {equals: () => false}});
      try {
        await ArticlesCRUDService.updateArticle(mockData);
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
          const article = await ArticlesCRUDService.getArticle('slug', 1);
          expectedData.author.following = true;
          expect(article).toEqual(expectedData);
        });

    test(`should get the article and add favorited&followed: false
              because no authUserId provided`,
    async () => {
      const article = await ArticlesCRUDService
          .getArticle({slug: 'slug', authUserId: null});
      expect(article).toEqual(expectedData);
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
      jest.spyOn(ArticlesRepository, 'delete')
          .mockReturnValue({deletedCount: 1});
      const fn = async () => await ArticlesCRUDService
          .deleteArticle({slug: 'slug', authUserId: 1});
      expect(fn).not.toThrow(BadRequestError);
    });

    test('should throw an error if article wasn\'t deleted', async () => {
      try {
        jest.spyOn(ArticlesRepository, 'delete')
            .mockReturnValue({deletedCount: 0});
        await ArticlesCRUDService.deleteArticle({slug: 'slug', authUserId: 1});
      } catch (error) {
        expect(error.message)
            .toBe('Something went wrong whhile deleting the article');
      }
    });
  });
});
