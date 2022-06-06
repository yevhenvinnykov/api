const { NotFoundError } = require('../utils/errorHandler');
const db = require('../models');
const User = db.user;


class ProfilesService {

    static async getProfile(authUserId, username) {
        const [authUser, profile] = await ProfilesService.#fetchDataFromDB(authUserId, username);
        const isProfileFollowed = authUser?.following.some(u => u._id.equals(profile._id));
        return { profile: { ...profile._doc, following: isProfileFollowed } };
    }

    static async followProfile(authUserId, username) {
        const [authUser, profile] = await ProfilesService.#fetchDataFromDB(authUserId, username);
        if (!authUser?.following.some(u => u.equals(profile._id))) {
            authUser.following.push(profile._id);
            await authUser.save();
        }
        return { profile: { ...profile._doc, following: true } };
    }

    static async unfollowProfile(authUserId, username) {
        const [authUser, profile] = await ProfilesService.#fetchDataFromDB(authUserId, username);
        const index = authUser?.following.findIndex(id => id.equals(profile._id));
        if (index !== -1) {
            authUser.following.splice(index, 1);
            await authUser.save();
        }
        return { profile: { ...profile._doc, following: false } };
    }

    static async #fetchDataFromDB(authUserId, username) {
        const authUser = await User.findOne({ _id: authUserId }).exec();
        const profile = await User.findOne({ username }).select('username email bio image').exec();
        if (!profile) throw new NotFoundError('User not found');
        return [authUser, profile];
    }

};

module.exports = ProfilesService;