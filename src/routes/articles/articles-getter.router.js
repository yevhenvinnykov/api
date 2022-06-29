const ArticlesGetterController = require('../../controllers/articles/articles-getter.controller');

const TokenMiddleware = require('../../middleware/token/token.middleware');


module.exports = (app) => {
  app.get(
      '/api/articles/feed',
      [TokenMiddleware.verifyToken],
      ArticlesGetterController.getArticlesFromFollowedUsers,
  );
  app.get(
      '/api/articles/',
      [TokenMiddleware.verifyOptionalToken],
      ArticlesGetterController.getArticles,
  );
  app.get(
      '/api/tags',
      ArticlesGetterController.getTags,
  );
};

