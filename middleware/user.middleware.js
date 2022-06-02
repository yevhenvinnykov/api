const db = require('../models');
const User = db.user;
const { createError } = require('../utils/index');

checkIfUserExists = (req, res, next) => {
    const email = req.body.user.email;
    if(!email) return next();
    User.findOne({
        email: email
    }).exec((err, user) => {
        if (err) return res.status(500).send(createError('Something went wrong'));
        if (user) return res.status(400).send(createError('User with this email already exists'));
        const username = req.body.user.username;
        if(!username) return next();
        User.findOne({
            username: username
        }).exec((err, user) => {
            if (err) res.status(500).send(createError('Something went wrong'));
            if (user) return res.status(400).send(createError('User with this username already exists'));
            next();
        });
    });
};

validateEmail = (req, res, next) => {
    const email = req.body.user.email;
    if(!email) return next();
    const validator = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!validator.test(req.body.user.email)) return res.status(400)
        .send(createError('Invalid email'));
    next();
};

validatePassword = (req, res, next) => {
    const password = req.body.user.password;
    if(!password) return next();
    const errors = [];
    if (password.length < 6 || password.length > 25) {
        errors.push('Password must be between 6 and 25 characters long');
    }
    if (!/.*\d/.test(password)) errors.push('Password must contain at least one digit');
    if (!/.*[A-Z]/.test(password)) errors.push('Password must contain at least one capital letter');
    if (errors.length) return res.status(400).send(createError(errors));
    next();
};


module.exports = {
    checkIfUserExists,
    validateEmail,
    validatePassword
};