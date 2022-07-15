const {
  BadRequestError,
  NotFoundError,
} = require('../../middleware/errors/errorHandler');
const UsersRepository = require('../../db/repos/users/index');
const SessionService = require('../session/session.service');

const UsersService = {
  async createUser({ userData }) {
    const user = await UsersRepository.create(userData);

    if (!user) {
      throw new BadRequestError('Something went wrong when creating the user');
    }

    user.token = SessionService.createToken(user.id);
    return user;
  },

  async updateUser({ authUserId, userData }) {
    const user = await UsersRepository.update(authUserId, userData);

    if (!user) throw new NotFoundError('User not found');

    user.token = SessionService.createToken(user.id);

    return user;
  },
};

module.exports = UsersService;
