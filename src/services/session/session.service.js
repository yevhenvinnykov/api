const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {BadRequestError, NotFoundError} = require('../../middleware/errors/errorHandler');
const UsersRepository = require('../../db/repos/users/users.repository');


const SessionService = {
  async getLoggedInUser({authUserId}) {
    const user = await UsersRepository.findOneBy('id', authUserId);
    if (!user) throw new NotFoundError('User not found');

    return {
      email: user.email,
      token: token = this.createToken(user.id),
      username: user.username,
      image: user.image,
      bio: user.bio,
    };
  },

  async logIn(email, password) {
    let user = await UsersRepository.findOneBy('email', email, ['password']);
    if (!user) throw new NotFoundError('User not found');

    this.validatePassword(password, user.password);

    user = await UsersRepository.findOneBy('email', email);

    return {
      email: user.email,
      token: token = this.createToken(user.id),
      username: user.username,
      image: user.image,
      bio: user.bio,
    };
  },

  createToken(id) {
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: 3600});
  },

  validatePassword(decoded, encoded) {
    if (!bcrypt.compareSync(decoded, encoded)) {
      throw new BadRequestError('Email or password is not valid');
    }
  },
};

module.exports = SessionService;
