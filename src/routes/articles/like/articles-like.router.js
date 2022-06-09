const ArticlesLikeController =
require('../../../controllers/articles/like/articles-like.controller');

const TokenMiddleware = require('../../../middleware/token/token.middleware');

module.exports = (app) => {
  app.post(
      '/api/articles/:slug/favorite',
      [TokenMiddleware.verifyToken],
      ArticlesLikeController.likeArticle,
  );
  app.delete(
      '/api/articles/:slug/favorite',
      [TokenMiddleware.verifyToken],
      ArticlesLikeController.dislikeArticle,
  );
};

