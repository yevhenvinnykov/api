const ArticlesService = require('../../services/articles/articles.service');
const { ErrorHandler } = require('../../middleware/errors/errorHandler');

const ArticlesLikeController = {
  async likeArticle(req, res) {
    try {
      const article = await ArticlesService.like(req.params.slug, req.userId);
      res.status(200).json({ article });
    } catch (error) {
      ErrorHandler.catchError(res, error);
    }
  },

  async dislikeArticle(req, res) {
    try {
      const article = await ArticlesService.dislike(
        req.params.slug,
        req.userId
      );
      res.status(200).json({ article });
    } catch (error) {
      ErrorHandler.catchError(res, error);
    }
  },
};

module.exports = ArticlesLikeController;
