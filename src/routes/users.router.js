const UserMiddleware = require('../middleware/user/user.middleware');

const TokenMiddleware = require('../middleware/token/token.middleware');

const UsersController = require('../controllers/users.controller');

module.exports = (app) => {
  app.post(
      '/api/users/signup',
      [
        UserMiddleware.checkIfUserExists,
        UserMiddleware.validateEmail,
        UserMiddleware.validatePassword,
      ],
      UsersController.signUp)
  ;

  app.put(
      '/api/users',
      [
        TokenMiddleware.verifyToken,
        UserMiddleware.checkIfUserExists,
        UserMiddleware.validateEmail,
        UserMiddleware.validatePassword,
      ],
      UsersController.updateUser,
  );
};

