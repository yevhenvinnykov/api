const CommentsService = require('../services/comments.service');
const { ErrorHandler } = require('../utils/errorHandler');

class CommentsController {
    static async createComment(req, res) {
        try {
            const userId = req.userId;
            const { slug } = req.params;
            const comment = await CommentsService.createComment(userId, slug, req.body.comment.body);
            res.status(200).json({ comment });
        } catch (error) {
           ErrorHandler.catchError(res, error);
        }
    }

    static async getComments(req, res) {
        try {
            const { slug } = req.params;
            const comments = await CommentsService.getComments(slug);
            res.status(200).send({ comments });
        } catch (error) {
            ErrorHandler.catchError(res, error);
        }
    };

    static async deleteComment(req, res) {
        try {
            const { id } = req.params;
            await CommentsService.deleteComment(id, req.userId);
            res.status(200).json({});
        } catch (error) {
            ErrorHandler.catchError(res, error);
        }
    };
}

module.exports = CommentsController;