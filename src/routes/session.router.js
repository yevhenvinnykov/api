const SessionController = require('../controllers/session.controller');
const TokenMiddleware = require('../middleware/token/token.middleware');

module.exports = (app) => {
  app.post('/api/users/login', SessionController.logIn);
  app.get(
    '/api/users',
    [TokenMiddleware.verifyToken],
    SessionController.getLoggedInUser
  );
};
