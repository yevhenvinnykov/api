const {ErrorHandler, BadRequestError} = require('../errors/errorHandler');
const UsersRepository = require('../../db/repos/users/users.repository');

const UserMiddleware = {
  async checkIfUserExists(req, res, next) {
    try {
      const {email, username} = req.body.user;
      const user = await UsersRepository
          .findOneByOr([{email}, {username}], ['email', 'username']);
      if (!user) return next();
      const takenField = user.email === email ? 'email' : 'username';
      throw new BadRequestError(`User with this ${takenField} already exists`);
    } catch (error) {
      ErrorHandler.catchError(res, error);
    }
  },

  validateEmail(req, res, next) {
    try {
      const email = req.body.user.email;
      if (!email) return next();
      const validator = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      if (!validator.test(email)) {
        throw new BadRequestError('Enter a valid email');
      }
      next();
    } catch (error) {
      ErrorHandler.catchError(res, error);
    }
  },

  validatePassword(req, res, next) {
    try {
      const password = req.body.user.password;
      if (!password) return next();
      const errors = [];
      if (password.length < 6 || password.length > 25) {
        errors.push('Password must be between 6 and 25 characters long');
      }
      if (!/.*\d/.test(password)) {
        errors.push('Password must contain at least one digit');
      }
      if (!/.*[A-Z]/.test(password)) {
        errors.push('Password must contain at least one capital letter');
      }
      if (errors.length) throw new BadRequestError(errors);
      next();
    } catch (error) {
      ErrorHandler.catchError(res, error);
    }
  },
};


module.exports = UserMiddleware;
