const {NotFoundError} = require('../../utils/errorHandler');
const UsersRepository = require('../../db/users.repository');


const ProfilesService = {
  async getProfile(authUserId, username) {
    const [authUser, profile] = await this
        .fetchDataFromDB(authUserId, username);
    const isProfileFollowed = authUser?.following
        .some((u) => u._id.equals(profile._id));
    return {profile: {...profile._doc, following: isProfileFollowed}};
  },

  async followProfile(authUserId, username) {
    const [authUser, profile] = await this
        .fetchDataFromDB(authUserId, username);
    if (!authUser?.following.some((u) => u.equals(profile._id))) {
      await UsersRepository.follow(authUser, profile._id);
    }
    return {profile: {...profile._doc, following: true}};
  },

  async unfollowProfile(authUserId, username) {
    const [authUser, profile] = await this
        .fetchDataFromDB(authUserId, username);
    const index = authUser?.following.findIndex((id) => id.equals(profile._id));
    if (index !== -1) await UsersRepository.unfollow(authUser, index);
    return {profile: {...profile._doc, following: false}};
  },

  async fetchDataFromDB(authUserId, username) {
    const authUser = await UsersRepository.findOneBy('_id', authUserId, ' ');
    const profile = await UsersRepository
        .findOneBy('username', username, 'username email bio image');
    if (!authUser || !profile) throw new NotFoundError('User not found');
    return [authUser, profile];
  },
};

module.exports = ProfilesService;
