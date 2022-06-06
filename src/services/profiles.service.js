const { NotFoundError } = require('../utils/errorHandler');
const db = require('../models');
const User = db.user;


class ProfilesService {

    static async getProfile(authUserId, username) {
        const [authUser, profile] = await ProfilesService.fetchDataFromDB(authUserId, username);
        const isProfileFollowed = authUser?.following.some(u => u._id.equals(profile._id));
        return ProfilesService.addFollowInfoToProfile(profile, isProfileFollowed);
    }

    static async followProfile(authUserId, username) {
        const [authUser, profile] = await ProfilesService.fetchDataFromDB(authUserId, username);
        if (!authUser?.following.some(u => u.equals(profile._id))) {
            authUser.following.push(profile._id);
            await authUser.save();
        }
        return ProfilesService.addFollowInfoToProfile(profile, true);
    }

    static async unfollowProfile(authUserId, username) {
        const [authUser, profile] = await ProfilesService.fetchDataFromDB(authUserId, username);
        const index = authUser?.following.findIndex(id => id.equals(profile._id));
        if (index !== -1) {
            authUser.following.splice(index, 1);
            await authUser.save();
        }
        return ProfilesService.addFollowInfoToProfile(profile, false);

    }

    static async fetchDataFromDB(authUserId, username) {
        const authUser = await User.findOne({ _id: authUserId }).exec();
        const profile = await User.findOne({ username }).exec();
        if (!profile) throw new NotFoundError('User not found');
        return [authUser, profile];
    }

    static addFollowInfoToProfile(profile, isProfileFollowed){
        return {
            profile: {
                username: profile.username,
                bio: profile.bio,
                image: profile.image,
                following: isProfileFollowed
            }
        };
    }
};

module.exports = ProfilesService;