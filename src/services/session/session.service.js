const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {
  BadRequestError,
  NotFoundError,
} = require('../../middleware/errors/errorHandler');
const UsersRepository = require('../../db/repos/users/index');

const SessionService = {
  async getLoggedInUser({ authUserId }) {
    const user = await UsersRepository.findOneBy('id', authUserId);
    if (!user) throw new NotFoundError('User not found');

    user.token = this.createToken(user.id);

    return user;
  },

  async logIn(email, password) {
    const attributes = ['username', 'email', 'bio', 'image', 'id', 'password'];
    const user = await UsersRepository.findOneBy('email', email, attributes);
    if (!user) throw new NotFoundError('User not found');

    this.validatePassword(password, user.password);
    user.token = this.createToken(user.id);

    return user;
  },

  createToken(id) {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: 3600 });
  },

  validatePassword(decoded, encoded) {
    if (!bcrypt.compareSync(decoded, encoded)) {
      throw new BadRequestError('Email or password is not valid');
    }
  },
};

module.exports = SessionService;
