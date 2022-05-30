const { checkIfUserExists } = require('../middleware/signup.middleware');

const { logIn, signUp, getLoggedInUser, updateUser } = require('../controllers/users.controller');

module.exports = (app) => {
    app.post('/api/users/signup', [checkIfUserExists], signUp);
    app.post('/api/users/login', logIn);
    app.get('/api/users', getLoggedInUser);
    app.put('/api/users', updateUser);
};