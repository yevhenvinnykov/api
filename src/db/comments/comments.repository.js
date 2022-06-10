const db = require('../models');
const Comment = db.comment;

const CommentsRepository = {
  async create(commentBody, userId, articleId) {
    return await new Comment({
      body: commentBody,
      author: userId,
      article: articleId,
    }).save();
  },

  async findByArticleId(articleId) {
    return await Comment.find({article: articleId})
        .populate('author', 'image username bio following')
        .sort([['updatedAt', 'descending']])
        .exec();
  },

  async deleteOneById(id) {
    return await Comment.deleteOne({_id: id}).exec();
  },

  async findOneBy(field, value) {
    return await Comment.findOne({[field]: value}).exec();
  },
};

module.exports = CommentsRepository;
