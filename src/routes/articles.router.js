const ArticlesController = require('../controllers/articles.controller');

const {verifyToken} = require('../middleware/token.middleware');
const {verifyOptionalToken} = require('../middleware/optionalToken.middleware');
const {
  checkIfArticleTitleIsUnique,
} = require('../middleware/article.middleware');


module.exports = (app) => {
  app.post(
      '/api/articles',
      [verifyToken, checkIfArticleTitleIsUnique],
      ArticlesController.handleArticleCRUD,
  );
  app.get(
      '/api/articles/feed',
      [verifyToken],
      ArticlesController.getArticles,
  );
  app.post(
      '/api/articles/:slug/favorite',
      [verifyToken],
      ArticlesController.handleArticleLikeDislike,
  );
  app.put(
      '/api/articles/:slug',
      [verifyToken, checkIfArticleTitleIsUnique],
      ArticlesController.handleArticleCRUD,
  );
  app.get(
      '/api/articles/:slug',
      [verifyOptionalToken],
      ArticlesController.handleArticleCRUD,
  );
  app.delete(
      '/api/articles/:slug',
      [verifyToken],
      ArticlesController.handleArticleCRUD,
  );
  app.delete(
      '/api/articles/:slug/favorite',
      [verifyToken],
      ArticlesController.handleArticleLikeDislike,
  );
  app.get(
      '/api/articles',
      [verifyOptionalToken],
      ArticlesController.getArticles,
  );
  app.get('/api/tags/', ArticlesController.getTags);
};

