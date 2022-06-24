const UsersRepository = require('../../../db/repos/users/users.repository');
const ArticlesRepository = require('../../../db/repos/articles/articles.repository');
const {NotFoundError} = require('../../../middleware/errors/errorHandler');
const {Op} = require('sequelize');

const ArticlesDBService = {
  async fetchArticleFromDB(slug) {
    const article = await ArticlesRepository.findOneBy('slug', slug);

    if (!article) throw new NotFoundError('Article not found');

    return article;
  },

  async fetchArticlesFromDB(queryFromRequest) {
    const condtions = await this.createQueryConditions(queryFromRequest);

    const options = {
      limit: queryFromRequest?.limit,
      offset: queryFromRequest?.offset,
    };

    const articles = await ArticlesRepository.find(condtions, options);
    if (!articles) throw new NotFoundError('Articles not found');

    const articlesCount = await ArticlesRepository.count(condtions);

    return [articles, articlesCount];
  },

  async createQueryConditions(query) {
    const queryConditions = {};

    if (query?.author) {
      const author = await UsersRepository.findOneBy('username', query.author, ['id']);
      queryConditions.authorId = author.id;
    }

    if (query?.favorited) {
      const user = await UsersRepository.findOneBy('username', query.favorited, ['favorites']);
      if (process.env.ORM === 'MONGOOSE') {
        queryConditions._id = {$in: user.favorites};
      }
      if (process.env.ORM === 'SEQUELIZE') {
        queryConditions.id = {[Op.in]: user.favorites};
      }
    }

    if (query?.tag) {
      queryConditions.tagList = query.tag;
    }

    return queryConditions;
  },
};

module.exports = ArticlesDBService;
