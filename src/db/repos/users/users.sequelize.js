const User = require('../../models/sequelize/user.model');
const bcrypt = require('bcryptjs');
// const Op = require('Sequelize').Op;

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
      following: JSON.stringify(authUser.following),
    }, {where: {id: authUserId}});
  },

  async unfollow(authUserId, index) {
    const authUser = await this.findOneBy('id', authUserId, ['following']);
    authUser.following.splice(index, 1);
    await User.update({
      following: JSON.stringify(authUser.following),
    }, {where: {id: authUserId}});
  },

  async findOneBy(
      field,
      value,
      attributes = ['username', 'email', 'bio', 'image', 'id'],
  ) {
    const user = await User.findOne({where: {[field]: value}, attributes});
    if (user.following) user.following = JSON.parse(user.following);
    if (user.favorites) user.favorites = JSON.parse(user.favorites);
    return user;
  },

  async findOneByOr(values, attributes = ['username', 'email', 'bio', 'image', 'id']) {
    // return await User.findOne({where: {[Op.or]: [values]}, attributes});
    // TODO: OBVIOUSLY HAS TO BE REFACTORED
    const userWithEmail = values[0].email && await User.findOne({where: values[0], attributes});
    const userWithUsername = values[1].username &&
    await User.findOne({where: values[1], attributes});
    return userWithEmail || userWithUsername || null;
  },
};

module.exports = UsersSequelize;
