const ProfilesService = require('../services/profiles/profiles.service');
const {ErrorHandler} = require('../middleware/errors/errorHandler');


const ProfilesController = {
  async getProfile(req, res) {
    try {
      const profile = await ProfilesService
          .getProfile(req.userId, req.params.username);
      res.status(200).json(profile);
    } catch (error) {
      ErrorHandler.catchError(res, error);
    }
  },

  async followProfile(req, res) {
    try {
      const profile = await ProfilesService
          .followProfile(req.userId, req.params.username);
      res.status(200).json(profile);
    } catch (error) {
      ErrorHandler.catchError(res, error);
    }
  },

  async unfollowProfile(req, res) {
    try {
      const profile = await ProfilesService
          .unfollowProfile(req.userId, req.params.username);
      res.status(200).json(profile);
    } catch (error) {
      ErrorHandler.catchError(res, error);
    }
  },
};

module.exports = ProfilesController;
