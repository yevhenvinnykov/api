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

logIn = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.user.email }).exec();
        if (!user) return res.status(404).send(createError('User not found'));
        const passwordIsValid = bcrypt.compareSync(
            req.body.user.password,
            user.password
        );
        if (!passwordIsValid) {
            return res.status(401).send(createError('Email or password is not valid'));
        }
        res.status(200).send(createUserResponse(user));
    } catch (error) {
        handleError(error, res);
    }
};

getLoggedInUser = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.userId });
        if (!user) return res.status(404).send(createError('User not found'));
        res.status(200).send(createUserResponse(user));
    } catch (error) {
        handleError(error, res);
    }
};

updateUser = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.userId }).exec();
        if (!user) return res.status(404).send(createError('User not found'));
        const updatedUser = await updateUserHelper(user, req.body.user);
        res.status(200).send(createUserResponse(updatedUser));
    } catch (error) {
        handleError(error, res);
    }
};

handleError = (error, res) => {
    res.status(500).send(createError('Something went wrong'));
};

createUserResponse = (user) => {
    return {
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            bio: user.bio,
            image: user.image,
            token: createToken(user.id),
        }
    };
};

module.exports = {
    signUp,
    logIn,
    getLoggedInUser,
    updateUser
};