const db = require('../models');
const User = db.user;
const bcrypt = require('bcryptjs');
const createToken = require('./createToken');

module.exports = async (userData) => {
    const user = await new User({
        username: userData.username,
        email: userData.email,
        password: bcrypt.hashSync(userData.password, 8),
    }).save();
    return {
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            bio: user.bio,
            image: user.image,
            token: createToken(user.id),
        }
    }
};