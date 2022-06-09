const db = require('./models');
const Comment = db.comment;

class CommentsRepository {
  static async create(commentBody, userId, articleId) {
    return await new Comment({
      body: commentBody,
      author: userId,
      article: articleId,
    }).save();
  }

  static async findByArticleId(articleId) {
    return await Comment.find({article: articleId})
        .populate('author', 'image username bio following')
        .sort([['updatedAt', 'descending']])
        .exec();
  }

  static async deleteOneById(id) {
    return await Comment.deleteOne({_id: id}).exec();
  }

  static async findOneBy(field, value) {
    return await Comment.findOne({[field]: value}).exec();
  }
}

module.exports = CommentsRepository;
