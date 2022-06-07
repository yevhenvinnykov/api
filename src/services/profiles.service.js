const {NotFoundError} = require('../utils/errorHandler');
const UsersDB = require('../db/users.db');


class ProfilesService {
  static async getProfile(authUserId, username) {
    const [authUser, profile] = await ProfilesService
        .#fetchDataFromDB(authUserId, username);
    const isProfileFollowed = authUser?.following
        .some((u) => u._id.equals(profile._id));
    return {profile: {...profile._doc, following: isProfileFollowed}};
  }

  static async followProfile(authUserId, username) {
    const [authUser, profile] = await ProfilesService
        .#fetchDataFromDB(authUserId, username);
    if (!authUser?.following.some((u) => u.equals(profile._id))) {
      await UsersDB.follow(authUser, profile._id);
    }
    return {profile: {...profile._doc, following: true}};
  }

  static async unfollowProfile(authUserId, username) {
    const [authUser, profile] = await ProfilesService
        .#fetchDataFromDB(authUserId, username);
    const index = authUser?.following.findIndex((id) => id.equals(profile._id));
    if (index !== -1) await UsersDB.unfollow(authUser, index);
    return {profile: {...profile._doc, following: false}};
  }

  static async #fetchDataFromDB(authUserId, username) {
    const authUser = await UsersDB.findOneBy('_id', authUserId, ' ');
    const profile = await UsersDB
        .findOneBy('username', username, 'username email bio image');
    if (!authUser || !profile) throw new NotFoundError('User not found');
    return [authUser, profile];
  }
};

module.exports = ProfilesService;
