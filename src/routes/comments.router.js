const CommentsController = require('../controllers/comments.controller');

const { verifyToken } = require('../middleware/token.middleware');

module.exports = (app) => {
    app.post('/api/articles/:slug/comments', [verifyToken], CommentsController.createComment);
    app.get('/api/articles/:slug/comments', CommentsController.getComments);
    app.delete('/api/articles/:slug/comments/:id', [verifyToken], CommentsController.deleteComment);
};