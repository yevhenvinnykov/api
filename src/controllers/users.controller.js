const UsersService = require('../services/users.service');
const { createToken, createError } = require('../oldUtils/index');

const { ErrorHandler } = require('../utils/ErrorHandler');

class UsersController {
    static async signUp(req, res) {
        try {
            const user = await UsersService.createUser(req.body.user);
            res.status(200).send(user);
        } catch (error) {
            return ErrorHandler.catchError(res, error);
        }
    }

    static async logIn(req, res) {
        try {
            const { email, password } = req.body.user;
            const user = await UsersService.logIn(email, password);
            res.status(200).send(createUserResponse(user));
        } catch (error) {
            return ErrorHandler.catchError(res, error);
        }
    };

    static async getLoggedInUser(req, res) {
        try {
            const user = await UsersService.getLoggedInUser(req.userId);
            res.status(200).send(createUserResponse(user));
        } catch (error) {
            return ErrorHandler.catchError(res, error);
        }
    };

    static async updateUser(req, res) {
        try {
            const { user: userData } = req.body;
            const updatedUser = await UsersService.updateUser(req.userId, userData);
            res.status(200).send(createUserResponse(updatedUser));
        } catch (error) {
            return ErrorHandler.catchError(res, error);
        }
    };
};

createUserResponse = (user) => {
    return {
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            bio: user.bio,
            image: user.image,
            token: createToken(user.id),
        }
    };
}

module.exports = UsersController;