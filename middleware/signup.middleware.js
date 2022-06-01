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

module.exports = {
    checkIfUserExists
};