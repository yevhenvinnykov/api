const {
    createArticle,
    updateArticle,
    getArticle,
    deleteArticle,
    likeArticle,
    dislikeArticle,
    getArticlesFromFollowedUsers,
    getArticles
} = require('../controllers/articles.controller');

const { verifyToken } = require('../middleware/token.middleware');
const { articleToken } = require('../middleware/articleToken.middleware');


module.exports = (app) => {
    app.post('/api/articles', [verifyToken], createArticle);
    app.get('/api/articles/feed', [verifyToken], getArticlesFromFollowedUsers);
    app.post('/api/articles/:slug/favorite', [verifyToken], likeArticle);
    app.put('/api/articles/:slug', [verifyToken], updateArticle);
    app.get('/api/articles/:slug', [articleToken], getArticle);
    app.delete('/api/articles/:slug', [verifyToken], deleteArticle);
    app.delete('/api/articles/:slug/favorite', [verifyToken], dislikeArticle);
    app.get('/api/articles', [articleToken], getArticles);
    app.get('/api/tags/', getTags);
};