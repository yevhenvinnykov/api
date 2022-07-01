const UsersRepository = require('../../../db/repos/users/index');
const ArticlesRepository = require('../../../db/repos/articles/index');
const {BadRequestError, NotFoundError} = require('../../../middleware/errors/errorHandler');


const ArticlesLikeService = {
  async likeArticle(slug, authUserId) {
    const [authUser, article] = await this.fetchDataFromDB(slug, authUserId);

    if (!authUser.favorites.includes(article.id)) {
      await ArticlesRepository.like(authUserId, article.id);
      article.favoritesCount++;
    }

    article.favorited = true;
    return article;
  },

  async dislikeArticle(slug, authUserId) {
    const [authUser, article] = await this.fetchDataFromDB(slug, authUserId);
    const index = authUser.favorites.indexOf(article.id);

    if (index !== -1) {
      await ArticlesRepository.dislike(authUserId, article.id);
      article.favoritesCount--;
    }

    article.favorited = false;
    return article;
  },

  async fetchDataFromDB(slug, authUserId) {
    const authUser = await UsersRepository
        .findOneBy('id', authUserId, ['favorites', 'following', 'id']);
    if (!authUser) throw new BadRequestError('You\'re not authorized');

    const article = await ArticlesRepository.findOneBy('slug', slug);
    if (!article) throw new NotFoundError('Article not found');

    return [authUser, article];
  },
};

module.exports = ArticlesLikeService;
