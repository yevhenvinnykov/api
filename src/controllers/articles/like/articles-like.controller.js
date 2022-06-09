const ArticlesLikeService = require('../../../services/articles/like/articles-like.service');
const {ErrorHandler} = require('../../../middleware/errors/errorHandler');

const ArticlesLikeController = {
  async likeArticle(req, res) {
    try {
      const article = await ArticlesLikeService.likeArticle(req.params.slug, req.userId);
      res.status(200).json({article});
    } catch (error) {
      ErrorHandler.catchError(res, error);
    }
  },

  async dislikeArticle(req, res) {
    try {
      const article = await ArticlesLikeService.dislikeArticle(req.params.slug, req.userId);
      res.status(200).json({article});
    } catch (error) {
      ErrorHandler.catchError(res, error);
    }
  },
};

module.exports = ArticlesLikeController;
