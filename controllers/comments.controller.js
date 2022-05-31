const db = require('../models');
const Comment = db.comment;
const jwt = require('jsonwebtoken');
const Article = db.article;
const User = db.user;

createComment = (req, res) => {
    let token = req.headers['x-access-token'];
    if (!token) {
        return res.status(403).send({ error: 'No token provided' });
    }
    jwt.verify(token, process.env.JWT_SECRET, {
        expiresIn: 3600
    }, (err, decoded) => {
        if (err) {
            return res.status(401).send({ error: 'Unauthorized' });
        }
        User.findOne({
            _id: decoded.id
        }, (err, authUser) => {
            Article.findOne({
                slug: req.params['slug'],
            }, (err, article) => {
                const comment = new Comment({
                    body: req.body.comment.body,
                    author: authUser._id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    article: article
                });
                comment.id = comment._id;
                comment.save((err, comment) => {
                    res.status(200).json({ comment });
                });
            });
        })
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
        }).populate('author').exec().then((comments) => {
            if (err) {
                res.status(500).send(err);
                return;
            }
            res.status(200).send({ comments });
        })
    });
};


deleteComment = (req, res) => {
    let token = req.headers['x-access-token'];
    if (!token) {
        return res.status(403).send({ error: 'No token provided' });
    }
    jwt.verify(token, process.env.JWT_SECRET, {
        expiresIn: 3600
    }, (err, decoded) => {
        if (err) {
            return res.status(401).send({ error: 'Unauthorized' });
        }
        User.findOne({
            _id: decoded.id
        }, (err, authUser) => {
            Article.findOne({
                slug: req.params['slug'],
            }, (err, article) => {
                Comment.deleteOne({
                    _id: req.params['id']
                }, (err, comment) => {
                    if (err) {
                        res.status(500).send(err);
                        return;
                    }
                    res.status(200).send({});
                });
            });
        })
    });
};

module.exports = {
    createComment,
    getComments,
    deleteComment
};