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
  app.post(
      '/api/users/login',
      UsersController.logIn,
  );
  app.get(
      '/api/users',
      [TokenMiddleware.verifyToken],
      UsersController.getLoggedInUser,
  );
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

