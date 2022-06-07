const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {BadRequestError, NotFoundError} = require('../utils/errorHandler');
const UsersDB = require('../db/users.db');

class UsersService {
  static async createUser({userData}) {
    await UsersDB.create(userData);
    const user = await UsersDB.findOneBy('email', userData.email);
    if (!user) throw new NotFoundError('User not found');
    user.token = UsersService.#createToken(user.id);
    return user;
  }

  static async getLoggedInUser({authUserId}) {
    const user = await UsersDB.findOneBy('_id', authUserId);
    if (!user) throw new NotFoundError('User not found');
    return user;
  }

  static async updateUser({authUserId, userData}) {
    const user = await UsersDB.findOneBy('_id', authUserId);
    if (!user) throw new NotFoundError('User not found');
    await UsersDB.update(user, userData);
    user.token = UsersService.#createToken(user.id);
    return user;
  }

  static async logIn(email, password) {
    let user = await UsersDB.findOneBy('email', email, 'password');
    if (!user) throw new NotFoundError('User not found');
    UsersService.#validatePassword(password, user.password);
    user = await UsersDB.findOneBy('email', email);
    user.token = UsersService.#createToken(user.id);
    return user;
  }

  static #createToken(id) {
    return jwt.sign({id}, process.env.JWT_SECRET = 'secret', {expiresIn: 3600});
  }

  static #validatePassword(decoded, encoded) {
    if (!bcrypt.compareSync(decoded, encoded)) {
      throw new BadRequestError('Email or password is not valid');
    }
  }
}

module.exports = UsersService;
