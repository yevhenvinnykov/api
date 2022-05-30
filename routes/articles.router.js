const { createArticle, updateArticle, getArticle, deleteArticle, likeArticle, dislikeArticle, getArticlesFromFollowedUsers } = require('../controllers/articles.controller');

module.exports = (app) => {
    app.post('/api/articles', createArticle);
    app.get('/api/articles/feed', getArticlesFromFollowedUsers);
    app.post('/api/articles/:slug/favorite', likeArticle);
    app.put('/api/articles/:slug', updateArticle);
    app.get('/api/articles/:slug', getArticle);
    app.delete('/api/articles/:slug', deleteArticle);
    app.delete('/api/articles/:slug/favorite', dislikeArticle);
};