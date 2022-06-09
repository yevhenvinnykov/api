const CommentsService = require('../services/comments/comments.service');
const {ErrorHandler} = require('../middleware/errors/errorHandler');

const CommentsController = {
  async getComments(req, res) {
    try {
      const comments = await CommentsService.getComments(req.params.slug);
      res.status(200).json({comments});
    } catch (error) {
      ErrorHandler.catchError(res, error);
    }
  },

  async createComment(req, res) {
    try {
      const data = {
        slug: req.params.slug,
        commentBody: req.body.comment.body,
        authUserId: req.userId,
      };
      const comment = await CommentsService.createComment(data);
      res.status(200).json({comment});
    } catch (error) {
      ErrorHandler.catchError(res, error);
    }
  },

  async deleteComment(req, res) {
    try {
      await CommentsService.deleteComment(req.params.id, req.userId);
      res.status(200).json({});
    } catch (error) {
      ErrorHandler.catchError(res, error);
    }
  },
};

module.exports = CommentsController;
