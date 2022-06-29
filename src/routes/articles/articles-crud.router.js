const ArticlesCRUDController = require('../../controllers/articles/articles-crud.controller');

const TokenMiddleware = require('../../middleware/token/token.middleware');
const ArticleMiddleware = require('../../middleware/article/article.middleware');


module.exports = (app) => {
  app.post(
      '/api/articles',
      [
        TokenMiddleware.verifyToken,
        ArticleMiddleware.checkIfTitleIsUnique,
      ],
      ArticlesCRUDController.createArticle,
  );
  app.put(
      '/api/articles/:slug',
      [
        TokenMiddleware.verifyToken,
        ArticleMiddleware.checkIfTitleIsUnique,
      ],
      ArticlesCRUDController.updateArticle,
  );
  app.get(
      '/api/articles/:slug',
      [TokenMiddleware.verifyOptionalToken],
      ArticlesCRUDController.getArticle,
  );
  app.delete(
      '/api/articles/:slug',
      [TokenMiddleware.verifyToken],
      ArticlesCRUDController.deleteArticle,
  );
};

