const db = require('../models');
const User = db.user;
const { createError } = require('../oldUtils/index');

getProfile = async (req, res) => {
    try {
        const authUser = await User.findOne({ _id: req.userId }).exec();
        const profile = await User.findOne({ username: req.params['username'] }).exec();
        if (!profile) return res.status(404)
            .send(createError('User not found'));
        res.status(200).send({
            profile: {
                username: profile.username,
                bio: profile.bio,
                image: profile.image,
                following: authUser.following.some(u => u._id.equals(profile._id))
            }
        });
    } catch (error) {
        handleError(error, res);
    }
};

followProfile = async (req, res) => {
    try {
        const authUser = await User.findOne({ _id: req.userId }).exec();
        const profile = await User.findOne({ username: req.params['username'] }).exec();
        if (!profile) return res.status(404).send(createError('User not found'));
        const response = {
            profile: {
                username: profile.username,
                bio: profile.bio,
                image: profile.image,
                following: true
            }
        };
        if (authUser.following.find(u => u.equals(profile._id))) {
            return res.status(200).send(response);
        }
        authUser.following.push(profile._id);
        await authUser.save();
        res.status(200).send(response);
    } catch (error) {
        handleError(error, res);
    }
};

unfollowProfile = async (req, res) => {
    try {
        const authUser = await User.findOne({ _id: req.userId }).exec();
        const profile = await User.findOne({ username: req.params['username'] }).exec();
        if (!profile) return res.status(404).send(createError('User not found'));
        const response = {
            profile: {
                username: profile.username,
                bio: profile.bio,
                image: profile.image,
                following: false
            }
        };
        const index = authUser.following.findIndex(id => id.equals(profile._id));
        if (index === -1) return res.status(200).send(response);
        authUser.following.splice(index, 1);
        await authUser.save();
        res.status(200).send(response);
    } catch (error) {
        handleError(error, res);
    }
};

handleError = (error, res) => {
    res.status(500).send(createError('Something went wrong'));
}

module.exports = {
    getProfile,
    followProfile,
    unfollowProfile
};