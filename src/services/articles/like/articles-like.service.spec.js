require('dotenv').config();
const ArticlesLikeService = require('./articles-like.service');
const ArticlesRepository = require('../../../db/repos/articles/articles.repository');
const UsersRepository = require('../../../db/repos/users/users.repository');


describe('ARTICLES LIKE SERVICE', () => {
  beforeEach(() => {
    mockArticle = {
      id: {toString: () => '1'},
      favoritesCount: 1,
      save: () => {},
    };
  });
  describe('LIKE ARTICLE', () => {
    beforeEach(() => {
      jest.spyOn(ArticlesRepository, 'findOneBy').mockReturnValue(mockArticle);
    });

    test('should increment favorites count', async () => {
      jest.spyOn(UsersRepository, 'findOneBy').mockReturnValue({
        favorites: [{toString: () => '2'}],
        save: () => {},
      });

      jest.spyOn(ArticlesRepository, 'like').mockImplementation(() => Promise.resolve());
      mockArticle.favoritesCount = 2;

      const article = await ArticlesLikeService.likeArticle({slug: 'slug', authUserId: 1});
      expect(article.favoritesCount).toBe(2);
      expect(article.favorited).toBe(true);
    });

    test('should add favorited: true witn no mutation since the article is liked', async () => {
      jest.spyOn(UsersRepository, 'findOneBy').mockReturnValue({
        favorites: [{toString: () => '1'}],
      });
      const article = await ArticlesLikeService.likeArticle({slug: 'slug', authUserId: 1});
      expect(article.favorited).toBe(true);
      expect(article.favoritesCount).toBe(1);
    });
  });
  describe('DISLIKE ARTICLE', () => {
    beforeEach(() => {
      jest.spyOn(ArticlesRepository, 'findOneBy').mockReturnValue(mockArticle);
    });

    test('should decrement favorites count', async () => {
      jest.spyOn(UsersRepository, 'findOneBy').mockReturnValue({
        favorites: [{toString: () => '1'}],
        save: () => {},
      });
      const article = await ArticlesLikeService.dislikeArticle({slug: 'slug', authUserId: 1});
      mockArticle.favoritesCount = 0;
      expect(article.favoritesCount).toBe(0);
      expect(article.favorited).toBe(false);
    });

    test('should add favorited: false with no mutation as the article is disliked', async () => {
      jest.spyOn(UsersRepository, 'findOneBy').mockReturnValue({
        favorites: [],
      });
      const article = await ArticlesLikeService.dislikeArticle({slug: 'slug', authUserId: 1});
      expect(article.favoritesCount).toBe(1);
      expect(article.favorited).toBe(false);
    });
  });
});
