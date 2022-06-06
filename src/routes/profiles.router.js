const ProfilesController = require('../controllers/profiles.controller');

const { verifyToken } = require('../middleware/token.middleware');

module.exports = (app) => {
    app.post('/api/profiles/:username/follow', [verifyToken], ProfilesController.followProfile);
    app.delete('/api/profiles/:username/follow', [verifyToken], ProfilesController.unfollowProfile);
    app.get('/api/profiles/:username', [verifyToken], ProfilesController.getProfile);
};