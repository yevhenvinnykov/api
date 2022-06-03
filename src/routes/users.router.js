const {
    checkIfUserExists,
    validateEmail,
    validatePassword
} = require('../middleware/user.middleware');

const { verifyToken } = require('../middleware/token.middleware');

const {
    logIn,
    signUp,
    getLoggedInUser,
    updateUser
} = require('../controllers/users.controller');

module.exports = (app) => {
    app.post('/api/users/signup', [checkIfUserExists, validateEmail, validatePassword], signUp);
    app.post('/api/users/login', logIn);
    app.get('/api/users', [verifyToken], getLoggedInUser);
    app.put('/api/users', [verifyToken, checkIfUserExists, validateEmail, validatePassword], updateUser);
};