const db = require('../models');
const User = db.user;
const bcrypt = require('bcryptjs');

const UsersRepository = {
  async create({username, email, password}) {
    return await new User({
      username,
      email,
      password: bcrypt.hashSync(password, 8),
    }).save();
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
    // return await user.save();
    await user.save();
    return user;
  },

  async follow(authUser, idToFollow) {
    authUser.following.push(idToFollow);
    return await authUser.save();
  },

  async unfollow(authUser, index) {
    authUser.following.splice(index, 1);
    return await authUser.save();
  },

  async findOneBy(
      field,
      value,
      options = 'username email token bio image',
  ) {
    return await User.findOne({[field]: value}).select(options).exec();
  },

  async findOneByOr(values, options = 'username email token bio image') {
    return await User.findOne({$or: values}).select(options).exec();
  },
};

module.exports = UsersRepository;
