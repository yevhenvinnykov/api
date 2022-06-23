const db = require('../../index');
const User = db.user;
const bcrypt = require('bcryptjs');

const UsersMongoose = {
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

    await user.save();
    return user;
  },

  async follow(authUserId, idToFollow) {
    const authUser = await this.findOneBy('id', authUserId, ['following']);
    authUser.following.push(idToFollow);
    await authUser.save();
  },

  async unfollow(authUserId, index) {
    const authUser = await this.findOneBy('id', authUserId, ['following']);
    authUser.following.splice(index, 1);
    await authUser.save();
  },

  async findOneBy(
      field,
      value,
      attributes = ['username', 'email', 'bio', 'image', 'id'],
  ) {
    field = field === 'id' ? '_id' : field;
    const user = await User.findOne({[field]: value}).select(attributes.join(' ')).exec();

    return user;
  },

  async findOneByOr(condtitions, attributes = ['username', 'email', 'bio', 'image', 'id']) {
    return await User.findOne({$or: condtitions}).select(attributes.join(' ')).exec();
  },
};

module.exports = UsersMongoose;
