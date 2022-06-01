const db = require('../models');
const User = db.user;

checkIfUserExists = (req, res, next) => {
    User.findOne({
        email: req.body.user.email
    }).exec((err, user) => {
        if (err) return res.status(500).send({ error: err });
        if (user) return res.status(400).send({ error: 'User already exists' });
        User.findOne({
            username: req.body.user.username
        }).exec((err, user) => {
            if (err) res.status(500).send({ error: err });
            if (user) return res.status(400).send({ error: 'User already exists' });
            next();
        });
    });
};

validateEmail = (req, res, next) => {
    const validator = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!validator.test(req.body.user.email)) return res.status(400)
        .send({ error: 'Invalid email' });
    next();
};

validatePassword = (req, res, next) => {
    const errors = [];
    const password = req.body.user.password;
    if (password.length < 6 || password.length > 25) {
        errors.push('Password must be between 6 and 25 characters long');
    }
    if (!/.*\d/.test(password)) errors.push('Password must contain at least one digit');
    if (!/.*[A-Z]/.test(password)) errors.push('Password must contain at least one capital letter');
    if (errors.length) return res.status(400).send({ error: errors });
    next();
};


module.exports = {
    checkIfUserExists,
    validateEmail,
    validatePassword
};