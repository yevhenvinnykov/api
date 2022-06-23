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
    const comments = await Comment.find({article: articleId})
        .populate('author', 'image username bio following')
        .sort([['updatedAt', 'descending']])
        .exec();

    return comments.map((comment) => ({...comment.toJSON(), id: comment._id}));
  },

  async deleteOneById(id) {
    return await Comment.deleteOne({_id: id}).exec();
  },

  async findOneBy(field, value) {
    field = field === 'id' ? '_id' : field;
    const comment = await Comment.findOne({[field]: value}).exec();
    if (comment) {
      return {...comment.toJSON(), authorId: comment.author._id};
    }
  },
};

module.exports = CommentsRepository;
