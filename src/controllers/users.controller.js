const UsersService = require('../services/users.service');
const { ErrorHandler } = require('../utils/ErrorHandler');


class UsersController {

    static async handleUserCRU_(req, res) {
        let action;
        switch (req.method) {
            case 'POST': action = 'createUser';
                break;
            case 'GET': action = 'getLoggedInUser';
                break;
            case 'PUT': action = 'updateUser';
        }
        try {
            const data = { userData: req?.body?.user, authUserId: req.userId };
            const user = await UsersService[action](data);
            res.status(200).send({ user });
        } catch (error) {
            return ErrorHandler.catchError(res, error);
        }
    }

    static async logIn(req, res) {
        try {
            const { email, password } = req.body.user;
            const user = await UsersService.logIn(email, password);
            res.status(200).send({ user });
        } catch (error) {
            return ErrorHandler.catchError(res, error);
        }
    }
};

module.exports = UsersController;