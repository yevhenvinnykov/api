const UsersRepository = require('../../../db/users.repository');
const ArticlesRepository = require('../../../db/articles/articles.repository');
const {NotFoundError} = require('../../../middleware/errors/errorHandler');


const ArticlesDBService = {
  async fetchAuthUserFromDB(authUserId) {
    const authUser = await UsersRepository
        .findOneBy('_id', authUserId, 'favorites following');

    if (!authUser) throw new NotFoundError('User not found');

    return authUser;
  },

  async fetchArticleFromDB(slug) {
    const article = await ArticlesRepository.findOneBy('slug', slug);

    if (!article) throw new NotFoundError('Article not found');

    return article;
  },

  async fetchArticlesFromDB(queryFromRequest) {
    const condtions = await this.createQueryConditions(queryFromRequest);

    const options = {
      limit: queryFromRequest?.limit || 5,
      offset: queryFromRequest?.offset || 0,
    };

    const articles = await ArticlesRepository.find(condtions, options);

    if (!articles) throw new NotFoundError('Articles not found');

    const articlesCount = await ArticlesRepository.count(condtions);

    return [articles, articlesCount];
  },

  async createQueryConditions(query) {
    const queryConditions = {};

    if (query?.author) {
      queryConditions.author = await UsersRepository
          .findOneBy('username', query.author, '_id');
    }

    if (query?.favorited) {
      const user = await UsersRepository
          .findOneBy('username', query.favorited, 'favorites');
      queryConditions._id = {$in: user?.favorites};
    }

    if (query?.tag) {
      queryConditions.tagList = query.tag;
    }

    return queryConditions;
  },
};

module.exports = ArticlesDBService;
