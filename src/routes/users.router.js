const {
    checkIfUserExists,
    validateEmail,
    validatePassword
} = require('../middleware/user.middleware');

const { verifyToken } = require('../middleware/token.middleware');

const UsersController = require('../controllers/users.controller');

module.exports = (app) => {
    app.post('/api/users/signup', [checkIfUserExists, validateEmail, validatePassword], UsersController.handleUserCRU_);
    app.post('/api/users/login', UsersController.logIn);
    app.get('/api/users', [verifyToken], UsersController.handleUserCRU_);
    app.put('/api/users', [verifyToken, checkIfUserExists, validateEmail, validatePassword], UsersController.handleUserCRU_);
};