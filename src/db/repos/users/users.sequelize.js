const User = require('../../models/sequelize/user.model');
const bcrypt = require('bcryptjs');
const Op = require('Sequelize').Op;
const Normalizer = require('../normalizer');

const UsersSequelize = {
  async create({ username, email, password }) {
    const user = await User.create({
      username,
      email,
      password: bcrypt.hashSync(password, 8),
    });

    return Normalizer.user(user);
  },

  async update(authUserId, userData) {
    const user = await this.findOneBy(
      'id',
      authUserId,
      this.defaultAttributes,
      'raw'
    );

    for (const prop in userData) {
      if (!(prop in user)) continue;
      if (prop === 'password') {
        user['password'] = bcrypt.hashSync(userData.password, 8);
        continue;
      }
      user[prop] = userData[prop];
    }
    await user.save();

    return Normalizer.user(user);
  },

  async follow(authUserId, idToFollow) {
    const authUser = await this.findOneBy('id', authUserId, ['following']);
    authUser.following.push(idToFollow);

    await User.update(
      {
        following: authUser.following,
      },
      { where: { id: authUserId } }
    );
  },

  async unfollow(authUserId, index) {
    const authUser = await this.findOneBy('id', authUserId, ['following']);
    authUser.following.splice(index, 1);

    await User.update(
      {
        following: authUser.following,
      },
      { where: { id: authUserId } }
    );
  },

  async findOneBy(
    field,
    value,
    attributes = this.defaultAttributes,
    normalizing
  ) {
    const user = await User.findOne({ where: { [field]: value }, attributes });

    if (normalizing === 'raw') return user;
    return Normalizer.user(user);
  },

  async findOneByOr(conditions, attributes = this.defaultAttributes) {
    const user = await User.findOne({
      where: { [Op.or]: conditions },
      attributes,
    });

    return Normalizer.user(user);
  },

  defaultAttributes: ['username', 'email', 'bio', 'image', 'id'],
};

module.exports = UsersSequelize;
