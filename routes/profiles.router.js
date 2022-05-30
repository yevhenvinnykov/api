const { getProfile, followProfile, unfollowProfile } = require('../controllers/profiles.controller');

module.exports = (app) => {
    app.post('/api/profiles/:username/follow', followProfile);
    app.delete('/api/profiles/:username/follow', unfollowProfile);
    app.get('/api/profiles/:username', getProfile);
};