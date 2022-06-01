const db = require('../models');
const User = db.user;
const bcrypt = require('bcryptjs');

module.exports = (userData) => {
    const defaultUserImage = 'https://st3.depositphotos.com/2229436/13671/v/600/depositphotos_136717406-stock-illustration-flat-user-icon-member-sign.jpg';
    return new User({
        username: userData.username,
        email: userData.email,
        password: bcrypt.hashSync(userData.password, 8),
        bio: '',
        image: defaultUserImage,
        favorites: [],
        following: [],
    });
};