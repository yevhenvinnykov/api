const {NotFoundError, BadRequestError} = require('../../middleware/errors/errorHandler');
const UsersRepository = require('../../db/users/users.repository');


const ProfilesService = {
  async getProfile(authUserId, username) {
    const [authUser, profile] = await this.fetchDataFromDB(authUserId, username);

    const isProfileFollowed = !!authUser && authUser.following.some((id) => id.equals(profile._id));

    return {profile: {...profile._doc, following: isProfileFollowed}};
  },

  async followProfile(authUserId, username) {
    const [authUser, profile] = await this.fetchDataFromDB(authUserId, username);
    if (!authUser) throw new BadRequestError('You\'re not authorized');

    if (!authUser.following.some((id) => id.equals(profile._id))) {
      await UsersRepository.follow(authUser, profile._id);
    }

    return {profile: {...profile._doc, following: true}};
  },

  async unfollowProfile(authUserId, username) {
    const [authUser, profile] = await this.fetchDataFromDB(authUserId, username);
    if (!authUser) throw new BadRequestError('You\'re not authorized');

    const index = authUser.following.findIndex((id) => id.equals(profile._id));
    if (index !== -1) await UsersRepository.unfollow(authUser, index);

    return {profile: {...profile._doc, following: false}};
  },

  async fetchDataFromDB(authUserId, username) {
    const authUser = await UsersRepository.findOneBy('_id', authUserId, ' ');
    const profile = await UsersRepository
        .findOneBy('username', username, 'username email bio image');

    if (!profile) throw new NotFoundError('User not found');

    return [authUser, profile];
  },
};

module.exports = ProfilesService;
