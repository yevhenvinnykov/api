const orm = process.env.ORM === 'MONGOOSE' ?
require('./users.mongoose') :
require('./users.sequelize');

const UsersRepository = {
  async create({username, email, password}) {
    return await orm.create({username, email, password});
  },

  async update(userId, userData) {
    return await orm.update(userId, userData);
  },

  async follow(authUserId, idToFollow) {
    return await orm.follow(authUserId, idToFollow);
  },

  async unfollow(authUserId, index) {
    return await orm.unfollow(authUserId, index);
  },

  async findOneBy(field, value, attributes, normalizing) {
    return await orm.findOneBy(field, value, attributes, normalizing);
  },

  async findOneByOr(values, attributes) {
    return await orm.findOneByOr(values, attributes);
  },
};

module.exports = UsersRepository;
