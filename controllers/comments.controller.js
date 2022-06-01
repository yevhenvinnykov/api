const db = require('../models');
const Comment = db.comment;
const Article = db.article;
const User = db.user;

createComment = (req, res) => {
    User.findOne({
        _id: req.userId
    }, (err, authUser) => {
        Article.findOne({
            slug: req.params['slug'],
        }, (err, article) => {
            const comment = new Comment({
                body: req.body.comment.body,
                author: authUser._id,
                createdAt: new Date(),
                updatedAt: new Date(),
                article: article._id
            });
            comment.id = comment._id;
            comment.save((err, comment) => {
                res.status(200).json({ comment });
            });
        });
    });
};

getComments = (req, res) => {
    Article.findOne({
        slug: req.params['slug']
    }, (err, article) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        Comment.find({
            'article': article._id
        })
            .populate('author', 'image username bio following')
            .exec()
            .then((comments) => {
                if (err) {
                    res.status(500).send(err);
                    return;
                }
                res.status(200).send({ comments });
            });
    });
};

deleteComment = (req, res) => {
    Comment.findOne({
        _id: req.params['id']
    }, (err, comment) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        if (comment.author.equals(req.userId)) {
            Comment.deleteOne({
                _id: req.params['id']
            }, (err, data) => {
                if (err) {
                    res.status(500).send(err);
                    return;
                }
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