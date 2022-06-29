const ArticlesService = require('../../services/articles/articles.service');
const {ErrorHandler} = require('../../middleware/errors/errorHandler');

const ArticlesGetterController = {
  async getArticles(req, res) {
    try {
      const {articles, articlesCount} = await ArticlesService.getMany(req.userId, req.query);
      res.status(200).json({articles, articlesCount});
    } catch (error) {
      ErrorHandler.catchError(res, error);
    }
  },

  async getArticlesFromFollowedUsers(req, res) {
    try {
      const {articles, articlesCount} = await ArticlesService
          .getFromFollowed(req.userId, req.query);
      res.status(200).json({articles, articlesCount});
    } catch (error) {
      ErrorHandler.catchError(res, error);
    }
  },

  async getTags(req, res) {
    try {
      const tags = await ArticlesService.getTags();
      res.status(200).json({tags});
    } catch (error) {
      ErrorHandler.catchError(res, error);
    }
  },
};

module.exports = ArticlesGetterController;
