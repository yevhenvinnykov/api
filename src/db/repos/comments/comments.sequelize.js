const Comment = require('../../models/sequelize/comment.model');
const User = require('../../models/sequelize/user.model');
const Normalizer = require('../normalizer');

const CommentsSequelize = {
  async create(commentBody, userId, articleId) {
    const comment = await Comment.create({
      body: commentBody,
      authorId: userId,
      articleId: articleId,
    });

    return this.findOneBy('id', comment.id);
  },

  async findByArticleId(articleId) {
    const comments = await Comment.findAll({
      where: { articleId },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['username', 'bio', 'image', 'id'],
        },
      ],
      order: [['updatedAt', 'DESC']],
    });

    return comments.map((comment) => Normalizer.comment(comment));
  },

  async deleteOneById(id) {
    const deletedCount = await Comment.destroy({ where: { id } });

    return { deletedCount };
  },

  async findOneBy(field, value) {
    const comment = await Comment.findOne({
      where: { [field]: value },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['username', 'bio', 'image', 'id'],
        },
      ],
    });

    return Normalizer.comment(comment);
  },
};

module.exports = CommentsSequelize;
