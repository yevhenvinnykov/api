const {BadRequestError, NotFoundError} = require('../../middleware/errors/errorHandler');
const CommentsRepository = require('../../db/comments/comments.repository');
const ArticlesRepository = require('../../db/articles/articles.repository');

const CommentsService = {
  async createComment({authUserId, slug, commentBody}) {
    const article = await ArticlesRepository.findOneBy('slug', slug);
    if (!article) throw new NotFoundError('Article not found');

    const comment = await CommentsRepository
        .create(commentBody, authUserId, article._id);
    if (!comment) {
      throw new BadRequestError('Something went wrong while creating the comment');
    }

    return comment;
  },

  async getComments(slug) {
    const article = await await ArticlesRepository.findOneBy('slug', slug);
    if (!article) throw new NotFoundError('Article not found');

    const comments = await CommentsRepository.findByArticleId(article._id);
    if (!comments) throw new NotFoundError('Comments not found');

    return comments;
  },

  async deleteComment(commentId, authUserId) {
    const comment = await CommentsRepository.findOneBy('_id', commentId);
    if (!comment) throw new NotFoundError('Comment not found');

    if (!comment.author.equals(authUserId)) {
      throw new BadRequestError('You are not authorized');
    }

    const {deletedCount} = await CommentsRepository.deleteOneById(commentId);
    if (!deletedCount) throw new BadRequestError('Something went wrong while deleting the comment');
  },
};

module.exports = CommentsService;
