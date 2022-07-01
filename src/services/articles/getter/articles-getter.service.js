require('dotenv').config();
const UsersRepository = require('../../../db/repos/users/index');
const ArticlesRepository = require('../../../db/repos/articles/index');
const createMongoConditions = require('./createMongoConditions');
const createSequelizeConditions = require('./createSequelizeConditions');
const {NotFoundError} = require('../../../middleware/errors/errorHandler');

const ArticlesGetterService = {

  async getArticles(authUserId, query) {
    const {
      articles,
      articlesCount,
      authUser,
    } = await this.fetchDataFromDB(authUserId, query);

    if (authUser) {
      articles.forEach((article) => article.favorited = authUser.favorites.includes(article.id));
    }

    return {articles, articlesCount};
  },

  async getTags() {
    const {articles} = await this.fetchDataFromDB(null, {limit: 30});
    const tags = new Set();

    for (const article of articles) {
      article.tagList.forEach((tag) => tags.add(tag));
    }

    return [...tags];
  },

  async fetchDataFromDB(authUserId, query) {
    const data = {};

    if (authUserId) {
      const authUser = await UsersRepository.findOneBy('id', authUserId, ['favorites']);
      if (!authUser) throw new NotFoundError('User not found');
      data.authUser = authUser;
    }

    const options = {
      limit: query?.limit ? Number(query.limit) : 5,
      offset: query?.offset ? Number(query.offset) : 0,
    };

    const condtions = process.env.ORM === 'MONGOOSE'
    ? await createMongoConditions(query)
    : await createSequelizeConditions(query);

    const articles = await ArticlesRepository.find(condtions, options);
    if (!articles) throw new NotFoundError('Articles not found');
    data.articles = articles;

    data.articlesCount = await ArticlesRepository.count(condtions);

    return data;
  },
};

module.exports = ArticlesGetterService;
