const User = require('../../models/sequelize/user.model');
const bcrypt = require('bcryptjs');
const Op = require('Sequelize').Op;

const UsersSequelize = {
  async create({username, email, password}) {
    const user = await User.create({
      username,
      email,
      password: bcrypt.hashSync(password, 8),
    });
    return user;
  },

  async update(user, userData) {
    for (const prop in userData) {
      if (!(prop in user)) continue;
      if (prop === 'password') {
        user['password'] = bcrypt.hashSync(userData.password, 8);
        continue;
      }
      user[prop] = userData[prop];
    }
    await user.save();
    return user;
  },

  async follow(authUserId, idToFollow) {
    const authUser = await this.findOneBy('id', authUserId, ['following']);
    authUser.following.push(idToFollow);
    await User.update({
      following: authUser.following,
    }, {where: {id: authUserId}});
  },

  async unfollow(authUserId, index) {
    const authUser = await this.findOneBy('id', authUserId, ['following']);
    authUser.following.splice(index, 1);
    await User.update({
      following: authUser.following,
    }, {where: {id: authUserId}});
  },

  async findOneBy(
      field,
      value,
      attributes = ['username', 'email', 'bio', 'image', 'id'],
  ) {
    return await User.findOne({where: {[field]: value}, attributes});
  },

  async findOneByOr(conditions, attributes = ['username', 'email', 'bio', 'image', 'id']) {
    return await User.findOne({where: {[Op.or]: conditions}, attributes});
  },
};

module.exports = UsersSequelize;
