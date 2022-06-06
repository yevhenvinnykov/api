const ProfilesService = require('../services/profiles.service');
const { ErrorHandler } = require('../utils/errorHandler');


class ProfilesController {

    static getProfile(req, res) {
        ProfilesController.doProfileAction('getProfile', req, res);
    }

    static followProfile(req, res) {
        ProfilesController.doProfileAction('followProfile', req, res);
    }

    static unfollowProfile(req, res) {
        ProfilesController.doProfileAction('unfollowProfile', req, res);
    }

    static async doProfileAction(action, req, res) {
        try {
            const profile = await ProfilesService[action](req.userId, req.params.username);
            res.status(200).json(profile);
        } catch (error) {
            ErrorHandler.catchError(res, error);
        }
    }
}

module.exports = ProfilesController;
