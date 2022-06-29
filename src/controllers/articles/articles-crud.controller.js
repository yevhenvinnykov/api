const ArticlesService = require('../../services/articles/articles.service');
const {ErrorHandler} = require('../../middleware/errors/errorHandler');

const ArticlesCRUDController = {
  async createArticle(req, res) {
    try {
      const article = await ArticlesService.create(req.userId, req.body.article);
      res.status(200).json({article});
    } catch (error) {
      ErrorHandler.catchError(res, error);
    }
  },

  async getArticle(req, res) {
    try {
      const article = await ArticlesService.getOne(req.params.slug, req.userId);
      res.status(200).json({article});
    } catch (error) {
      ErrorHandler.catchError(res, error);
    }
  },

  async updateArticle(req, res) {
    try {
      const data = {
        slug: req.params.slug,
        authUserId: req.userId,
        updateData: req.body.article,
      };
      const article = await ArticlesService.update(data);
      res.status(200).json({article});
    } catch (error) {
      ErrorHandler.catchError(res, error);
    }
  },

  async deleteArticle(req, res) {
    try {
      const article = await ArticlesService.delete(req.params.slug, req.userId);
      res.status(200).json({article});
    } catch (error) {
      ErrorHandler.catchError(res, error);
    }
  },
};

module.exports = ArticlesCRUDController;
