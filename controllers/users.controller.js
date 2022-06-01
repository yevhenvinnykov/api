const bcrypt = require('bcryptjs');
const db = require('../models');
const User = db.user;
const {
    createToken,
    createUser,
    updateUserHelper
} = require('../utils/index');

signUp = (req, res) => {
    createUser(req.body.user)
        .save((err, user) => {
            if (err) return res.status(500).send({ error: err });
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

logIn = (req, res) => {
    User.findOne({
        email: req.body.user.email
    }, (err, user) => {
        if (err) return res.status(500).send({ error: err });
        if (!user) return res.status(404).send({ error: 'User not found' });
        const passwordIsValid = bcrypt.compareSync(
            req.body.user.password,
            user.password
        );
        if (!passwordIsValid) {
            return res.status(401).send({
                token: null,
                message: 'Email or password is invalid'
            });
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
        if (err) return res.status(500).send({ error: err });
        if (!user) return res.status(404).send({ error: 'User not found' });
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
        if (err) return res.status(500).send({ error: err });
        if (!user) return res.status(404).send({ error: 'User not found' });
        updateUserHelper(user, req.body.user)
            .save(err => {
                if (err) return res.status(500).send({ error: err });
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