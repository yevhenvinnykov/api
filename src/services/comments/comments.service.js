const {BadRequestError, NotFoundError} = require('../../utils/errorHandler');
const CommentsRepository = require('../../db/comments.repository');
const ArticlesRepository = require('../../db/articles.repository');

class CommentsService {
  static async createComment({authUserId, slug, commentBody}) {
    const article = await ArticlesRepository.findOneBy('slug', slug);
    if (!article) throw new NotFoundError('Article not found');
    const comment = await CommentsRepository
        .create(commentBody, authUserId, article._id);
    if (!comment) {
      throw new BadRequestError('Something went wrong when creating comment');
    }
    return comment;
  }

  static async getComments({slug}) {
    const article = await await ArticlesRepository.findOneBy('slug', slug);
    if (!article) throw new NotFoundError('Article not found');
    const comments = await CommentsRepository.findByArticleId(article._id);
    if (!comments) throw new NotFoundError('Comments not found');
    return comments;
  }

  static async deleteComment({commentId, authUserId}) {
    const comment = await CommentsRepository.findOneBy('_id', commentId);
    if (!comment) throw new NotFoundError('Comment not found');
    if (!comment.author.equals(authUserId)) {
      throw new BadRequestError('You are not authorized');
    }
    const {deletedCount} = await CommentsRepository.deleteOneById(commentId);
    if (!deletedCount) throw new BadRequestError('Something went wrong');
  }
}

module.exports = CommentsService;
