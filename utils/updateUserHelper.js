const bcrypt = require('bcryptjs');

module.exports = (user, userData) => {
    for (prop in userData) {
        if (prop === 'password' && userData.password.length) {
            user['password'] = bcrypt.hashSync(userData.password, 8);
            continue;
        }
        if (prop !== 'password') {
            user[prop] = userData[prop];
        }
    }
    return user;
};