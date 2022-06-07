const {BadRequestError, NotFoundError} = require('../utils/errorHandler');
const CommentDB = require('../db/comments.db');
const ArticlesDB = require('../db/articles.db');

class CommentsService {
  static async createComment({authUserId, slug, commentBody}) {
    const article = await ArticlesDB.findOneBy('slug', slug);
    if (!article) throw new NotFoundError('Article not found');
    const comment = await CommentDB
        .create(commentBody, authUserId, article._id);
    if (!comment) {
      throw new BadRequestError('Something went wrong when creating comment');
    }
    return comment;
  }

  static async getComments({slug}) {
    const article = await await ArticlesDB.findOneBy('slug', slug);
    if (!article) throw new NotFoundError('Article not found');
    const comments = await CommentDB.findByArticleId(article._id);
    if (!comments) throw new NotFoundError('Comments not found');
    return comments;
  }

  static async deleteComment({commentId, authUserId}) {
    const comment = await CommentDB.findOneBy('_id', commentId);
    if (!comment) throw new NotFoundError('Comment not found');
    if (!comment.author.equals(authUserId)) {
      throw new BadRequestError('You are not authorized');
    }
    const {deletedCount} = await CommentDB.deleteOneById(commentId);
    if (!deletedCount) throw new BadRequestError('Something went wrong');
  }
}

module.exports = CommentsService;
