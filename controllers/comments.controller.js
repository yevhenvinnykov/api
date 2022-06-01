const db = require('../models');
const Comment = db.comment;
const Article = db.article;
const User = db.user;
const { createCommentHelper, createError } = require('../utils/index');

createComment = (req, res) => {
    User.findOne({
        _id: req.userId
    }, (err, authUser) => {
        Article.findOne({
            slug: req.params['slug'],
        }, (err, article) => {
            if (err) return res.status(500).send(createError('Something went wrong'));
            createCommentHelper(req.body.comment.body, authUser._id, article._id)
                .save((err, comment) => {
                    if (err) return res.status(500).send(createError('Something went wrong'));
                    res.status(200).json({ comment });
                });
        });
    });
};

getComments = (req, res) => {
    Article.findOne({
        slug: req.params['slug']
    }, (err, article) => {
        if (err) return res.status(500).send(createError('Something went wrong'));
        Comment.find({
            'article': article._id
        }).populate('author', 'image username bio following')
            .exec()
            .then((comments) => {
                if (err) return res.status(500).send(createError('Something went wrong'));
                res.status(200).send({ comments });
            });
    });
};

deleteComment = (req, res) => {
    Comment.findOne({
        _id: req.params['id']
    }, (err, comment) => {
        if (err) return res.status(500).send(createError('Something went wrong'));
        if (comment.author.equals(req.userId)) {
            Comment.deleteOne({
                _id: req.params['id']
            }, (err, data) => {
                if (err) return res.status(500).send(err);
                res.status(200).send({});
            });
        };
    });
};

module.exports = {
    createComment,
    getComments,
    deleteComment
};