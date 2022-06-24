const {NotFoundError, BadRequestError} = require('../../middleware/errors/errorHandler');
const UsersRepository = require('../../db/repos/users/users.repository');


const ProfilesService = {
  async getProfile(authUserId, username) {
    const [authUser, profile] = await this.fetchDataFromDB(authUserId, username);

    const isProfileFollowed = !!authUser && authUser.following.some((id) => id === profile.id);

    return {
      profile: {
        username: profile.username,
        bio: profile.bio,
        image: profile.image,
        following: isProfileFollowed,
      },
    };
  },

  async followProfile(authUserId, username) {
    const [authUser, profile] = await this.fetchDataFromDB(authUserId, username);
    if (!authUser) throw new BadRequestError('You\'re not authorized');

    if (!authUser.following.some((id) => id === profile.id)) {
      await UsersRepository.follow(authUserId, profile.id);
    }

    return {
      profile: {
        username: profile.username,
        bio: profile.bio,
        image: profile.image,
        following: true,
      },
    };
  },

  async unfollowProfile(authUserId, username) {
    const [authUser, profile] = await this.fetchDataFromDB(authUserId, username);
    if (!authUser) throw new BadRequestError('You\'re not authorized');

    const index = authUser.following.findIndex((id) => id === profile.id);
    if (index !== -1) await UsersRepository.unfollow(authUserId, index);

    return {
      profile: {
        username: profile.username,
        bio: profile.bio,
        image: profile.image,
        following: false,
      },
    };
  },

  async fetchDataFromDB(authUserId, username) {
    const authUser = await UsersRepository.findOneBy('id', authUserId, ['following']);
    const profile = await UsersRepository
        .findOneBy('username', username, ['username', 'email', 'bio', 'image', 'id']);

    if (!profile) throw new NotFoundError('User not found');

    return [authUser, profile];
  },
};

module.exports = ProfilesService;
