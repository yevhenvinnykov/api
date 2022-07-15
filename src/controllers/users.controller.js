const UsersService = require('../services/users/users.service');
const { ErrorHandler } = require('../middleware/errors/ErrorHandler');

const UsersController = {
  async signUp(req, res) {
    try {
      const data = { userData: req.body.user };
      const user = await UsersService.createUser(data);
      res.status(200).json({ user });
    } catch (error) {
      return ErrorHandler.catchError(res, error);
    }
  },

  async updateUser(req, res) {
    try {
      const data = { userData: req.body.user, authUserId: req.userId };
      const user = await UsersService.updateUser(data);
      res.status(200).json({ user });
    } catch (error) {
      return ErrorHandler.catchError(res, error);
    }
  },
};

module.exports = UsersController;
