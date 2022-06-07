const ProfilesController = require('../controllers/profiles.controller');

const {verifyToken} = require('../middleware/token.middleware');

module.exports = (app) => {
  app.post(
      '/api/profiles/:username/follow',
      [verifyToken],
      ProfilesController.handleProfileCR_D,
  );
  app.delete(
      '/api/profiles/:username/follow',
      [verifyToken],
      ProfilesController.handleProfileCR_D,
  );
  app.get(
      '/api/profiles/:username',
      [verifyToken],
      ProfilesController.handleProfileCR_D,
  );
};

