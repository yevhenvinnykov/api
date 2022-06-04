const db = require('../models');
const User = db.user;
const { createError } = require('../oldUtils/index');

checkIfUserExists = async (req, res, next) => {
    try {
        const email = req.body.user.email;
        const username = req.body.user.username;
        const user = await User.findOne({ $or: [{ email }, { username }] }).exec();
        if (!user) return next();
        const takenField = user.email === email ? 'email' : 'username';
        res.status(400).send(createError(`User with this ${takenField} already exists`));
    } catch (error) {
        res.status(500).send(createError('Something went wrong'));
    }
};

validateEmail = (req, res, next) => {
    const email = req.body.user.email;
    if (!email) return next();
    const validator = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!validator.test(req.body.user.email)) return res.status(400)
        .send(createError('Invalid email'));
    next();
};

validatePassword = (req, res, next) => {
    const password = req.body.user.password;
    if (!password) return next();
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