const bcrypt = require('bcryptjs');

module.exports = (user, userData) => {
    for (prop in userData) {
        if (prop === 'password') {
            user['password'] = bcrypt.hashSync(userData.password, 8);
            continue;
        }
        user[prop] = userData[prop];
    }
    return user;
};