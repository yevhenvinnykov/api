const ArticlesLikeService = require('./articles-like.service');
const ArticlesRepository = require('../../../db/articles/articles.repository');
const UsersRepository = require('../../../db/users/users.repository');


describe('ARTICLES LIKE SERVICE', () => {
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
      const article = await ArticlesLikeService
          .likeArticle({slug: 'slug', authUserId: 1});
      expect(article).toEqual(expectedData);
    });

    test('should add favorited: true', async () => {
      jest.spyOn(UsersRepository, 'findOneBy').mockReturnValue({
        favorites: [{equals: () => true}],
      });
      const article = await ArticlesLikeService
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
          const article = await ArticlesLikeService
              .dislikeArticle({slug: 'slug', authUserId: 1});
          expect(article).toEqual(expectedData);
        });

    test('should add favorited: false', async () => {
      jest.spyOn(UsersRepository, 'findOneBy').mockReturnValue({
        favorites: [],
      });
      const article = await ArticlesLikeService
          .dislikeArticle({slug: 'slug', authUserId: 1});
      expect(article).toEqual(expectedData);
    });
  });
});
