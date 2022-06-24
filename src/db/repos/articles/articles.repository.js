const orm = process.env.ORM === 'MONGOOSE' ?
require('./articles.mongoose') :
require('./articles.sequelize');


const ArticlesRepository = {
  async create(authUserId, articleData) {
    return await orm.create(authUserId, articleData);
  },

  async update(article, updateData) {
    return await orm.update(article, updateData);
  },

  async delete(conditions) {
    return await orm.delete(conditions);
  },

  async like(authUserId, articleId) {
    return await orm.like(authUserId, articleId);
  },

  async dislike(authUserId, articleId) {
    return await orm.dislike(authUserId, articleId);
  },

  async findOneBy(field, value, normalizing) {
    return await orm.findOneBy(field, value, normalizing);
  },

  async find(condtions, options) {
    return await orm.find(condtions, options);
  },

  async count(conditions) {
    return await orm.countDocuments(conditions);
  },
};

module.exports = ArticlesRepository;
