const { createComment, getComments, deleteComment } = require('../controllers/comments.controller');

module.exports = (app) => {
    app.post('/api/articles/:slug/comments', createComment);
    app.get('/api/articles/:slug/comments', getComments);
    app.delete('/api/articles/:slug/comments/:id', deleteComment);
};