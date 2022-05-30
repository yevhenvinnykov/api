const db = require('../models');
const User = db.user;

checkIfUserExists = (req, res, next) => {
    User.findOne({
        email: req.body.email
    }).exec((err, user) => {
        if (err) {
            res.status(500).send({ error: err });
            return;
        }
        if (user) {
            res.status(400).send({ error: 'User already exists' });
            return;
        }
        User.findOne({
            username: req.body.username
        }).exec((err, user) => {
            if (err) {
                res.status(500).send({ error: err });
                return;
            }
            if (user) {
                res.status(400).send({ error: 'User already exists' });
                return;
            }
            next();
        });

    });
};

module.exports = {
    checkIfUserExists
};