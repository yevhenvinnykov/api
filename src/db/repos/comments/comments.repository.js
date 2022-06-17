const db = require('../../index');
const Comment = db.comment;

const CommentsRepository = {
  async create(commentBody, userId, articleId) {
    const comment = await new Comment({
      body: commentBody,
      author: userId,
      article: articleId,
    }).save();
    return comment;
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
    const comment = await Comment.findOne({[field]: value}).exec();
    console.log(comment);
    return comment;
  },
};

module.exports = CommentsRepository;
