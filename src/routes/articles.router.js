const ArticlesController = require('../controllers/articles.controller');

const TokenMiddleware = require('../middleware/token/token.middleware');
const ArticleMiddleware = require('../middleware/article/article.middleware');


module.exports = (app) => {
  app.post(
      '/api/articles',
      [
        TokenMiddleware.verifyToken,
        ArticleMiddleware.checkIfTitleIsUnique,
      ],
      ArticlesController.handleArticleCRUD.bind(ArticlesController),
  );
  app.get(
      '/api/articles/feed',
      [TokenMiddleware.verifyToken],
      ArticlesController.getArticles.bind(ArticlesController),
  );
  app.post(
      '/api/articles/:slug/favorite',
      [TokenMiddleware.verifyToken],
      ArticlesController.handleArticleLikeDislike.bind(ArticlesController),
  );
  app.put(
      '/api/articles/:slug',
      [
        TokenMiddleware.verifyToken,
        ArticleMiddleware.checkIfTitleIsUnique,
      ],
      ArticlesController.handleArticleCRUD.bind(ArticlesController),
  );
  app.get(
      '/api/articles/:slug',
      [TokenMiddleware.verifyOptionalToken],
      ArticlesController.handleArticleCRUD.bind(ArticlesController),
  );
  app.delete(
      '/api/articles/:slug',
      [TokenMiddleware.verifyToken],
      ArticlesController.handleArticleCRUD.bind(ArticlesController),
  );
  app.delete(
      '/api/articles/:slug/favorite',
      [TokenMiddleware.verifyToken],
      ArticlesController.handleArticleLikeDislike.bind(ArticlesController),
  );
  app.get(
      '/api/articles',
      [TokenMiddleware.verifyOptionalToken],
      ArticlesController.getArticles.bind(ArticlesController),
  );
  app.get(
      '/api/tags/',
      ArticlesController.getTags.bind(ArticlesController),
  );
};

