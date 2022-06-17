const orm = process.env.ORM === 'MONGOOSE' ?
require('./users.mongoose') :
require('./users.sequelize');

const UsersRepository = {
  async create({username, email, password}) {
    return await orm.create({username, email, password});
  },

  async update(user, userData) {
    return await orm.update(user, userData);
  },

  async follow(authUserId, idToFollow) {
    return await orm.follow(authUserId, idToFollow);
  },

  async unfollow(authUserId, index) {
    return await orm.unfollow(authUserId, index);
  },

  async findOneBy(field, value, attributes) {
    return await orm.findOneBy(field, value, attributes);
  },

  async findOneByOr(values, attributes) {
    return await orm.findOneByOr(values, attributes);
  },
};

module.exports = UsersRepository;
