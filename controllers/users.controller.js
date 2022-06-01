const bcrypt = require('bcryptjs');
const db = require('../models');
const User = db.user;
const { createToken } = require('../utils/index');

signUp = (req, res) => {
    new User({
        username: req.body.user.username,
        email: req.body.user.email,
        password: bcrypt.hashSync(req.body.user.password, 8)
    }).save((err, user) => {
        if (err) {
            res.status(500).send({ error: err });
            return;
        }
        user.bio = '';
        user.image = 'https://st3.depositphotos.com/2229436/13671/v/600/depositphotos_136717406-stock-illustration-flat-user-icon-member-sign.jpg';
        user.favorites = [];
        user.following = [];
        user.save(err => {
            if (err) {
                res.status(500).send({ error: err });
                return;
            }
            res.status(200).send({
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    bio: user.bio,
                    image: user.image,
                    token: createToken(user.id),
                }
            });

        });
    });
};

logIn = (req, res) => {
    User.findOne({
        email: req.body.user.email
    }, (err, user) => {
        if (err) {
            res.status(500).send({ error: err });
            return;
        }
        if (!user) {
            res.status(404).send({ error: 'User not found' });
            return;
        }
        const passwordIsValid = bcrypt.compareSync(
            req.body.user.password,
            user.password
        );
        if (!passwordIsValid) {
            res.status(401).send({
                token: null,
                message: 'Email or password is invalid'
            });
            return;
        }
        res.status(200).send({
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                bio: user.bio,
                image: user.image,
                token: createToken(user.id),
            }
        });
    });
};

getLoggedInUser = (req, res) => {
    User.findOne({
        _id: req.userId
    }, (err, user) => {
        if (err) {
            res.status(500).send({ error: err });
            return;
        }
        if (!user) {
            res.status(404).send({ error: 'User not found' });
            return;
        }
        res.status(200).send({
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                bio: user.bio,
                image: user.image,
                token: createToken(user.id),
            }
        });
    });
};


updateUser = (req, res) => {
    User.findOne({
        _id: req.userId
    }, (err, user) => {
        if (err) {
            res.status(500).send({ error: err });
            return;
        }
        if (!user) {
            res.status(404).send({ error: 'User not found' });
            return;
        }
        for (prop in req.body.user) {
            if (prop === 'password' && req.body.user.password.length) {
                user['password'] = bcrypt.hashSync(req.body.user.password, 8);
                continue;
            }
            if (prop !== 'password') {
                user[prop] = req.body.user[prop];
            }
        }
        user.save(err => {
            if (err) {
                res.status(500).send({ error: err });
                return;
            }
            res.status(200).send({
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    bio: user.bio,
                    image: user.image,
                    token: createToken(user.id),
                }
            });
        });
    });
};


module.exports = {
    signUp,
    logIn,
    getLoggedInUser,
    updateUser
};