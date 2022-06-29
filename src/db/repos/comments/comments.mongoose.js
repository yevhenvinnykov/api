const db = require('../../index');
const Comment = db.comment;
const Normalizer = require('../normalizer');

const CommentsMongoose = {
  async create(commentBody, userId, articleId) {
    const comment = await new Comment({
      body: commentBody,
      author: userId,
      article: articleId,
    }).save();

    return this.findOneBy('id', comment.id);
  },

  async findByArticleId(articleId) {
    const comments = await Comment.find({article: articleId})
        .populate('author', 'image username bio following')
        .sort([['updatedAt', 'descending']])
        .exec();

    return comments.map((comment) => Normalizer.comment(comment));
  },

  async deleteOneById(id) {
    return await Comment.deleteOne({_id: id}).exec();
  },

  async findOneBy(field, value) {
    field = field === 'id' ? '_id' : field;

    const comment = await Comment.findOne({[field]: value}).exec();

    if (comment) {
      return Normalizer.comment(comment);
    }
  },
};

module.exports = CommentsMongoose;
