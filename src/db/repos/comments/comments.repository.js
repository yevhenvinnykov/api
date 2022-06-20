const orm = process.env.ORM === 'MONGOOSE' ?
require('./comments.mongoose') :
require('./comments.sequelize');

const CommentsRepository = {
  async create(commentBody, userId, articleId) {
    return await orm.create(commentBody, userId, articleId);
  },

  async findByArticleId(articleId) {
    return await orm.findByArticleId(articleId);
  },

  async deleteOneById(id) {
    return await orm.deleteOneById(id);
  },

  async findOneBy(field, value) {
    return await orm.findOneBy(field, value);
  },
};

module.exports = CommentsRepository;
