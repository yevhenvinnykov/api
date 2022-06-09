const ArticlesDBService = require('../db/articles-db.service');

const ArticlesLikeService = {
  async likeArticle(slug, authUserId) {
    const authUser = await ArticlesDBService.fetchAuthUserFromDB(authUserId);
    const article = await ArticlesDBService.fetchArticleFromDB(slug);

    if (!authUser.favorites.some((id) => id.equals(article._id))) {
      article.favoritesCount++;
      authUser.favorites.push(article._id);
      await Promise.all([article.save(), authUser.save()]);
    }

    return {...article._doc, favorited: true};
  },

  async dislikeArticle(slug, authUserId) {
    const authUser = await ArticlesDBService.fetchAuthUserFromDB(authUserId);
    const article = await ArticlesDBService.fetchArticleFromDB(slug);

    const index = authUser.favorites.indexOf(article._id);
    if (index !== -1) {
      article.favoritesCount--;
      authUser.favorites.splice(index, 1);
      await Promise.all([article.save(), authUser.save()]);
    }

    return {...article._doc, favorited: false};
  },
};

module.exports = ArticlesLikeService;
