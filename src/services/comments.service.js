const db = require('../models');
const Article = db.article;
const Comment = db.comment;
const { ErrorHandler, BadRequestError, NotFoundError } = require('../utils/errorHandler');

class CommentsService {
    static async createComment(userId, slug, commentBody) {
        try {
            const article = await Article.findOne({ slug }).exec();
            const comment = await new Comment({
                body: commentBody,
                author: userId,
                article: article._id
            }).save();
            if (!comment) throw new BadRequestError('Something went wrong when creating comment');
            return comment;
        } catch (error) {
            ErrorHandler.catchError(res, error);
        }
    }

    static async getComments(slug) {
        try {
            const article = await Article.findOne({ slug }).exec();
            const comments = await Comment.find({ article: article._id })
                .populate('author', 'image username bio following')
                .sort([['updatedAt', 'descending']])
                .exec();
            if (!comments) throw new NotFoundError('Comments not found');
            return comments;
        } catch (error) {
            ErrorHandler.catchError(res, error);
        }
    }

    static async deleteComment(commentId, authUserId) {
        try {
            const comment = await Comment.findOne({ _id: commentId }).exec();
            if (!comment.author.equals(authUserId)) {
                throw new BadRequestError('You are not authorized');
            }
            const { deletedCount } = await Comment.deleteOne({ _id: commentId }).exec();
            if (!deletedCount) throw new NotFoundError('Comment not found');
        } catch (error) {
            ErrorHandler.catchError(res, error);
        }
    }
}

module.exports = CommentsService;