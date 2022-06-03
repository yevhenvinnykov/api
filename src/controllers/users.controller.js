const bcrypt = require('bcryptjs');
const db = require('../models');
const User = db.user;
const {
    createToken,
    createUser,
    updateUserHelper,
    createError
} = require('../utils/index');

signUp = async (req, res) => {
    try {
        const user = await createUser(req.body.user);
        res.status(200).send(user);
    } catch (error) {
        handleError(error, res);
    }
};

logIn = (req, res) => {
    User.findOne({
        email: req.body.user.email
    }, (err, user) => {
        if (err) return res.status(500).send(createError('Something went wrong'));
        if (!user) return res.status(404).send(createError('User not found'));
        const passwordIsValid = bcrypt.compareSync(
            req.body.user.password,
            user.password
        );
        if (!passwordIsValid) {
            return res.status(401).send(createError('Email or password is not valid'));
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
        if (err) return res.status(500).send(createError('Something went wrong'));
        if (!user) return res.status(404).send(createError('User not found'));
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
        if (err) return res.status(500).send(createError('Something went wrong'));
        if (!user) return res.status(404).send(createError('User not found'));
        updateUserHelper(user, req.body.user)
            .save(err => {
                if (err) return res.status(500).send(createError('Something went wrong'));
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

handleError = (error, res) => {
    res.status(500).send(createError('Something went wrong'));
};

module.exports = {
    signUp,
    logIn,
    getLoggedInUser,
    updateUser
};