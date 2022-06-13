const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {BadRequestError, NotFoundError} = require('../../middleware/errors/errorHandler');
const UsersRepository = require('../../db/users/users.repository');


const SessionService = {
  async getLoggedInUser({authUserId}) {
    const user = await UsersRepository.findOneBy('_id', authUserId);
    if (!user) throw new NotFoundError('User not found');

    return user;
  },

  async logIn(email, password) {
    let user = await UsersRepository.findOneBy('email', email, 'password');
    if (!user) throw new NotFoundError('User not found');

    this.validatePassword(password, user.password);

    user = await UsersRepository.findOneBy('email', email);
    user.token = this.createToken(user.id);

    return user;
  },

  createToken(id) {
    return jwt.sign({id}, process.env.JWT_SECRET = 'secret', {expiresIn: 3600});
  },

  validatePassword(decoded, encoded) {
    if (!bcrypt.compareSync(decoded, encoded)) {
      throw new BadRequestError('Email or password is not valid');
    }
  },
};

module.exports = SessionService;
