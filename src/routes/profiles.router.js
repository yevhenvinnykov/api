const ProfilesController = require('../controllers/profiles.controller');

const TokenMiddleware = require('../middleware/token/token.middleware');

module.exports = (app) => {
  app.post(
    '/api/profiles/:username/follow',
    [TokenMiddleware.verifyToken],
    ProfilesController.followProfile
  );
  app.delete(
    '/api/profiles/:username/follow',
    [TokenMiddleware.verifyToken],
    ProfilesController.unfollowProfile
  );
  app.get(
    '/api/profiles/:username',
    [TokenMiddleware.verifyToken],
    ProfilesController.getProfile
  );
};
