const CommentsController = require('../controllers/comments.controller');

const {verifyToken} = require('../middleware/token.middleware');

module.exports = (app) => {
  app.post(
      '/api/articles/:slug/comments',
      [verifyToken],
      CommentsController.handleCommentCR_D,
  );
  app.get(
      '/api/articles/:slug/comments',
      CommentsController.handleCommentCR_D,
  );
  app.delete(
      '/api/articles/:slug/comments/:id',
      [verifyToken],
      CommentsController.handleCommentCR_D,
  );
};
