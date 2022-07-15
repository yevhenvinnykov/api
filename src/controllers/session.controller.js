const SessionService = require('../services/session/session.service');
const { ErrorHandler } = require('../middleware/errors/errorHandler');

const SessionController = {
  async logIn(req, res) {
    try {
      const { email, password } = req.body.user;
      const user = await SessionService.logIn(email, password);
      res.status(200).json({ user });
    } catch (error) {
      return ErrorHandler.catchError(res, error);
    }
  },

  async getLoggedInUser(req, res) {
    try {
      const data = { authUserId: req.userId };
      const user = await SessionService.getLoggedInUser(data);
      res.status(200).json({ user });
    } catch (error) {
      return ErrorHandler.catchError(res, error);
    }
  },
};

module.exports = SessionController;
