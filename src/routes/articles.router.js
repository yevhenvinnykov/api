const ArticlesController = require('../controllers/articles.controller');

const {verifyToken} = require('../middleware/token/token.middleware');
const {verifyOptionalToken} = require('../middleware/optionalToken.middleware');
const {
  checkIfArticleTitleIsUnique,
} = require('../middleware/article/article.middleware');


module.exports = (app) => {
  app.post(
      '/api/articles',
      [verifyToken, checkIfArticleTitleIsUnique],
      ArticlesController.handleArticleCRUD.bind(ArticlesController),
  );
  app.get(
      '/api/articles/feed',
      [verifyToken],
      ArticlesController.getArticles.bind(ArticlesController),
  );
  app.post(
      '/api/articles/:slug/favorite',
      [verifyToken],
      ArticlesController.handleArticleLikeDislike.bind(ArticlesController),
  );
  app.put(
      '/api/articles/:slug',
      [verifyToken, checkIfArticleTitleIsUnique],
      ArticlesController.handleArticleCRUD.bind(ArticlesController),
  );
  app.get(
      '/api/articles/:slug',
      [verifyOptionalToken],
      ArticlesController.handleArticleCRUD.bind(ArticlesController),
  );
  app.delete(
      '/api/articles/:slug',
      [verifyToken],
      ArticlesController.handleArticleCRUD.bind(ArticlesController),
  );
  app.delete(
      '/api/articles/:slug/favorite',
      [verifyToken],
      ArticlesController.handleArticleLikeDislike.bind(ArticlesController),
  );
  app.get(
      '/api/articles',
      [verifyOptionalToken],
      ArticlesController.getArticles.bind(ArticlesController),
  );
  app.get('/api/tags/', ArticlesController.getTags.bind(ArticlesController));
};

