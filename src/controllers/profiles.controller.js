const ProfilesService = require('../services/profiles/profiles.service');
const {ErrorHandler} = require('../middleware/errors/errorHandler');


const ProfilesController = {
  async handleProfileCR_D(req, res) {
    try {
      let action;
      switch (req.method) {
        case 'GET': action = 'getProfile';
          break;
        case 'POST': action = 'followProfile';
          break;
        case 'DELETE': action = 'unfollowProfile';
      }
      const profile =
      await ProfilesService[action](req.userId, req.params.username);
      res.status(200).json(profile);
    } catch (error) {
      ErrorHandler.catchError(res, error);
    }
  },
};

module.exports = ProfilesController;
