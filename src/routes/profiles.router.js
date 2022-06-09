const ProfilesController = require('../controllers/profiles.controller');

const TokenMiddleware = require('../middleware/token/token.middleware');

module.exports = (app) => {
  app.post(
      '/api/profiles/:username/follow',
      [TokenMiddleware.verifyToken],
      ProfilesController.handleProfileCR_D,
  );
  app.delete(
      '/api/profiles/:username/follow',
      [TokenMiddleware.verifyToken],
      ProfilesController.handleProfileCR_D,
  );
  app.get(
      '/api/profiles/:username',
      [TokenMiddleware.verifyToken],
      ProfilesController.handleProfileCR_D,
  );
};

