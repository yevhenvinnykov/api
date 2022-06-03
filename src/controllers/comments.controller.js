const db = require('../models');
const Comment = db.comment;
const Article = db.article;
const User = db.user;
const { createCommentHelper, createError } = require('../utils/index');

createComment = async (req, res) => {
    try {
        const authUser = await User.findOne({ _id: req.userId }).exec();
        const article = await Article.findOne({ slug: req.params['slug'] }).exec();
        const comment = await createCommentHelper(req.body.comment.body, authUser._id, article._id).save();
        res.status(200).json({ comment });

    } catch (err) {
        handleError(error, res);
    }
};

getComments = async (req, res) => {
    try {
        const article = await Article.findOne({ slug: req.params['slug'] }).exec();
        const comments = await Comment.find({ article: article._id })
            .populate('author', 'image username bio following')
            .sort([['updatedAt', 'descending']])
            .exec();
        res.status(200).send({ comments });
    } catch (err) {
        handleError(error, res);
    }
};

deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findOne({ _id: req.params['id'] }).exec();
        if (comment.author.equals(req.userId)) {
            await Comment.deleteOne({ _id: req.params['id'] }).exec();
            res.status(200).send({});
        }
    } catch (error) {
        handleError(error, res);
    }
};

handleError = (err, res) => {
    res.status(500).send(createError('Something went wrong'));
};

module.exports = {
    createComment,
    getComments,
    deleteComment
};