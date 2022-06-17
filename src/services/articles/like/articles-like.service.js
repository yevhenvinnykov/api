const ArticlesDBService = require('../db/articles-db.service');
const UsersRepository = require('../../../db/repos/users/users.repository');
const {BadRequestError} = require('../../../middleware/errors/errorHandler');

const ArticlesLikeService = {
  async likeArticle(slug, authUserId) {
    const [authUser, article] = await this.fetchDataFromDB(slug, authUserId);

    if (!authUser.favorites.some((id) => id.equals(article.id))) {
      article.favoritesCount++;
      authUser.favorites.push(article.id);
      await Promise.all([article.save(), authUser.save()]);
    }

    return {...article._doc, favorited: true};
  },

  async dislikeArticle(slug, authUserId) {
    const [authUser, article] = await this.fetchDataFromDB(slug, authUserId);

    const index = authUser.favorites.indexOf(article.id);
    if (index !== -1) {
      article.favoritesCount--;
      authUser.favorites.splice(index, 1);
      await Promise.all([article.save(), authUser.save()]);
    }

    return {...article._doc, favorited: false};
  },

  async fetchDataFromDB(slug, authUserId) {
    const authUser = await UsersRepository.findOneBy('id', authUserId, ['favorites', 'following']);
    if (!authUser) throw new BadRequestError('You\'re not authorized');
    const article = await ArticlesDBService.fetchArticleFromDB(slug);

    return [authUser, article];
  },
};

module.exports = ArticlesLikeService;
