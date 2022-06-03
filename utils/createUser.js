const db = require('../models');
const User = db.user;
const bcrypt = require('bcryptjs');

module.exports = (userData) => {
    return new User({
        username: userData.username,
        email: userData.email,
        password: bcrypt.hashSync(userData.password, 8),
    });
};