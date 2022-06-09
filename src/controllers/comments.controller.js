const CommentsService = require('../services/comments/comments.service');
const {ErrorHandler} = require('../middleware/errors/errorHandler');

const CommentsController = {
  async handleCommentCR_D(req, res) {
    try {
      let action;
      switch (req.method) {
        case 'GET': action = 'getComments';
          break;
        case 'POST': action = 'createComment';
          break;
        case 'DELETE': action = 'deleteComment';
      }
      const data = {
        slug: req.params?.slug,
        commentBody: req.body?.comment?.body,
        authUserId: req.userId,
        commentId: req.params?.id,
      };
      const result = await CommentsService[action](data);
      if (action === 'createComment' || action === 'deleteComment') {
        return res.status(200).json({comment: result});
      }
      res.status(200).json({comments: result});
    } catch (error) {
      ErrorHandler.catchError(res, error);
    }
  },
};

module.exports = CommentsController;
