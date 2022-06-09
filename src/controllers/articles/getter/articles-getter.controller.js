const ArticlesGetterService = require('../../../services/articles/getter/articles-getter.service');
const {ErrorHandler} = require('../../../middleware/errors/errorHandler');

const ArticlesGetterController = {
  async getArticles(req, res) {
    try {
      const {articles, articlesCount} = await ArticlesGetterService
          .getArticles(req.userId, req.query);
      res.status(200).json({articles, articlesCount});
    } catch (error) {
      ErrorHandler.catchError(res, error);
    }
  },

  async getArticlesFromFollowedUsers(req, res) {
    try {
      const {articles, articlesCount} = await ArticlesGetterService
          .getArticlesFromFollowedUsers(req.userId, req.query);
      res.status(200).json({articles, articlesCount});
    } catch (error) {
      ErrorHandler.catchError(res, error);
    }
  },

  async getTags(req, res) {
    try {
      const tags = await ArticlesGetterService.getTags();
      res.status(200).json({tags});
    } catch (error) {
      ErrorHandler.catchError(res, error);
    }
  },
};

module.exports = ArticlesGetterController;
