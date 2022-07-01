const User = require('../../models/mongoose/user.model');
const bcrypt = require('bcryptjs');
const Normalizer = require('../normalizer');

const UsersMongoose = {
  async create({username, email, password}) {
    const user = await new User({
      username,
      email,
      password: bcrypt.hashSync(password, 8),
    }).save();

    return Normalizer.user(user);
  },

  async update(authUserId, userData) {
    const user = await this.findOneBy('id', authUserId, this.defaultAttributes, 'raw');

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
    const authUser = await this.findOneBy('id', authUserId, ['following'], 'raw');
    authUser.following.push(idToFollow);
    await authUser.save();
  },

  async unfollow(authUserId, index) {
    const authUser = await this.findOneBy('id', authUserId, ['following'], 'raw');
    authUser.following.splice(index, 1);
    await authUser.save();
  },

  async findOneBy(
      field,
      value,
      attributes = this.defaultAttributes,
      normalizing,
  ) {
    field = field === 'id' ? '_id' : field;

    const user = await User.findOne({[field]: value}).select(attributes.join(' ')).exec();

    if (normalizing === 'raw') return user;
    return Normalizer.user(user);
  },

  async findOneByOr(condtitions, attributes = this.defaultAttributes) {
    const user = await User.findOne({$or: condtitions}).select(attributes.join(' ')).exec();

    return Normalizer.user(user);
  },

  defaultAttributes: ['username', 'email', 'bio', 'image', 'id'],
};

module.exports = UsersMongoose;
