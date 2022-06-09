const CommentsController = require('../controllers/comments.controller');

const TokenMiddleware = require('../middleware/token/token.middleware');

module.exports = (app) => {
  app.post(
      '/api/articles/:slug/comments',
      [TokenMiddleware.verifyToken],
      CommentsController.handleCommentCR_D,
  );
  app.get(
      '/api/articles/:slug/comments',
      CommentsController.handleCommentCR_D,
  );
  app.delete(
      '/api/articles/:slug/comments/:id',
      [TokenMiddleware.verifyToken],
      CommentsController.handleCommentCR_D,
  );
};
