require('dotenv').config();
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
    const start = query?.offset ? +query.offset : 0;
    const end = query?.limit ? (+query.limit + start) : 5;

    for (const userId of authUser.following) {
      const userArticles = await ArticlesRepository.find({authorId: userId}, {limit: 0, offset: 0});
      articles.push(...userArticles);
      articlesCount += userArticles.length;
    }

    articles = articles.slice(start, end);
    articles.forEach((article) => article.favorited = authUser.favorites.includes(article.id));

    return {articles, articlesCount};
  },

  async getArticles(authUserId, query) {
    const [articles, articlesCount] = await ArticlesDBService.fetchArticlesFromDB(query);
    if (!authUserId) return {articles, articlesCount};

    const authUser = await UsersRepository.findOneBy('id', authUserId, ['favorites']);
    if (!authUser) throw new NotFoundError('User not found');

    articles.forEach((article) => article.favorited = authUser.favorites.includes(article.id));

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
};

module.exports = ArticlesGetterService;
