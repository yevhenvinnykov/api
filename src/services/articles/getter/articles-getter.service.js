const ArticlesRepository = require('../../../db/repos/articles/articles.repository');
const UsersRepository = require('../../../db/repos/users/users.repository');
const ArticlesDBService = require('../db/articles-db.service');
const {NotFoundError} = require('../../../middleware/errors/errorHandler');

const ArticlesGetterService = {
  async getArticlesFromFollowedUsers(authUserId, query) {
    // TODO: have to work on that method because it's gonna fetch
    // loads of unnecessary articles once the offset gets larger
    const authUser = await UsersRepository.findOneBy('id', authUserId, ['favorites', 'following']);
    if (!authUser) throw new NotFoundError('User not found');
    let articles = [];
    let articlesCount = 0;
    const start = +query?.offset || 0;
    const end = +query?.limit + start || 5;

    for (const userId of authUser.following) {
      const userArticles = await ArticlesRepository
          .find({authorId: userId}, {limit: 0, offset: 0});
      articles.push(...userArticles);
      articlesCount += userArticles.length;
    }

    articles = articles.slice(start, end);
    articles = this.addFavoritedInfoToArticles(articles, authUser.favorites);

    return {articles, articlesCount};
  },

  async getArticles(authUserId, query) {
    let [articles, articlesCount] = await ArticlesDBService.fetchArticlesFromDB(query);
    if (!authUserId) return {articles, articlesCount};

    const authUser = await UsersRepository.findOneBy('id', authUserId, ['favorites', 'following']);
    if (!authUser) throw new NotFoundError('User not found');
    articles = this.addFavoritedInfoToArticles(articles, authUser.favorites);

    return {articles, articlesCount};
  },

  async getTags() {
    const [articles] = await ArticlesDBService.fetchArticlesFromDB({limit: 30});
    const tags = new Set();

    for (const article of articles) {
      article.tagList.forEach((tag) => tags.add(tag));
    }

    return [...tags];
  },

  addFavoritedInfoToArticles(articles, authUserFavorites) {
    const articlesWithFavoriteInfo = [];
    for (const article of articles) {
      if (authUserFavorites.some((id) => id.toString() === article.id.toString())) {
        article.favorited = true;
        articlesWithFavoriteInfo.push(article);
        continue;
      }
      article.favorited = false;
      articlesWithFavoriteInfo.push(article);
    }
    return articlesWithFavoriteInfo;
  },
};

module.exports = ArticlesGetterService;
