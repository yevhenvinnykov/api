const {
    getProfile,
    followProfile,
    unfollowProfile
} = require('../controllers/profiles.controller');

const { verifyToken } = require('../middleware/token.middleware');

module.exports = (app) => {
    app.post('/api/profiles/:username/follow', [verifyToken], followProfile);
    app.delete('/api/profiles/:username/follow', [verifyToken], unfollowProfile);
    app.get('/api/profiles/:username', [verifyToken], getProfile);
};