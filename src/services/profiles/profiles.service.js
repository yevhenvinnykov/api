const {
  NotFoundError,
  BadRequestError,
} = require('../../middleware/errors/errorHandler');
const UsersRepository = require('../../db/repos/users/index');

const ProfilesService = {
  async getProfile(authUserId, username) {
    const [authUser, profile] = await this.fetchDataFromDB(
      authUserId,
      username
    );

    profile.following = authUser.following.includes(profile.id);

    return profile;
  },

  async followProfile(authUserId, username) {
    const [authUser, profile] = await this.fetchDataFromDB(
      authUserId,
      username
    );

    if (!authUser.following.includes(profile.id)) {
      await UsersRepository.follow(authUserId, profile.id);
    }
    profile.following = true;

    return profile;
  },

  async unfollowProfile(authUserId, username) {
    const [authUser, profile] = await this.fetchDataFromDB(
      authUserId,
      username
    );

    const index = authUser.following.findIndex((id) => id === profile.id);
    if (index !== -1) await UsersRepository.unfollow(authUserId, index);
    profile.following = false;

    return profile;
  },

  async fetchDataFromDB(authUserId, username) {
    const attributes = ['following'];
    const authUser = await UsersRepository.findOneBy(
      'id',
      authUserId,
      attributes
    );
    if (!authUser) throw new BadRequestError("You're not authorized");

    const profile = await UsersRepository.findOneBy('username', username);
    if (!profile) throw new NotFoundError('User not found');

    return [authUser, profile];
  },
};

module.exports = ProfilesService;
