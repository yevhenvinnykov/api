const Comment = require('../../models/sequelize/comment.model');
const User = require('../../models/sequelize/user.model');

const CommentsRepository = {
  async create(commentBody, userId, articleId) {
    const comment = await Comment.create({
      body: commentBody,
      authorId: userId,
      articleId: articleId,
    });
    return comment;
  },

  async findByArticleId(articleId) {
    return await Comment.findAll({where: {articleId}, include: [{
      model: User, as: 'author',
      attributes: ['username', 'bio', 'image', 'following', 'id'],
    }],
    });
  },

  async deleteOneById(id) {
    const deletedCount = await Comment.destroy({where: {id}});
    return {deletedCount};
  },

  async findOneBy(field, value) {
    const comment = await Comment.findOne({where: {[field]: value}});
    return comment;
  },
};

module.exports = CommentsRepository;
