const {BadRequestError, NotFoundError} = require('../../middleware/errors/errorHandler');
const UsersRepository = require('../../db/repos/users/users.repository');
const SessionService = require('../session/session.service');


const UsersService = {
  async createUser({userData}) {
    await UsersRepository.create(userData);

    const user = await UsersRepository.findOneBy('email', userData.email);
    if (!user) {
      throw new BadRequestError('Something went wrong when creating the user');
    }

    user.token = SessionService.createToken(user.id);
    return user;
  },

  async updateUser({authUserId, userData}) {
    const user = await UsersRepository.findOneBy('id', authUserId);
    if (!user) throw new NotFoundError('User not found');

    await UsersRepository.update(authUserId, userData);

    const updatedUser = await UsersRepository.findOneBy('id', authUserId);
    updatedUser.token = SessionService.createToken(user.id);

    return updatedUser;
  },
};

module.exports = UsersService;
