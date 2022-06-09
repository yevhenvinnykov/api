const UsersService = require('../services/users/users.service');
const {ErrorHandler} = require('../middleware/errors/ErrorHandler');


const UsersController = {
  async signUp(req, res) {
    try {
      const data = {userData: req.body.user};
      const user = await UsersService.createUser(data);
      res.status(200).json({user});
    } catch (error) {
      return ErrorHandler.catchError(res, error);
    }
  },

  async getLoggedInUser(req, res) {
    try {
      const data = {authUserId: req.userId};
      const user = await UsersService.getLoggedInUser(data);
      res.status(200).json({user});
    } catch (error) {
      return ErrorHandler.catchError(res, error);
    }
  },

  async updateUser(req, res) {
    try {
      const data = {userData: req.body.user, authUserId: req.userId};
      const user = await UsersService.updateUser(data);
      res.status(200).json({user});
    } catch (error) {
      return ErrorHandler.catchError(res, error);
    }
  },

  async logIn(req, res) {
    try {
      const {email, password} = req.body.user;
      const user = await UsersService.logIn(email, password);
      res.status(200).json({user});
    } catch (error) {
      return ErrorHandler.catchError(res, error);
    }
  },
};

module.exports = UsersController;
