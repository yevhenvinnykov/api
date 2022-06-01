const {
    createComment,
    getComments,
    deleteComment
} = require('../controllers/comments.controller');

const { verifyToken } = require('../middleware/token.middleware');


module.exports = (app) => {
    app.post('/api/articles/:slug/comments', [verifyToken], createComment);
    app.get('/api/articles/:slug/comments', getComments);
    app.delete('/api/articles/:slug/comments/:id', [verifyToken], deleteComment);
};