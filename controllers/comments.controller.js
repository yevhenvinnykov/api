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
            console.log(authUser);
            Article.findOne({
                slug: req.params['slug'],
            }, (err, article) => {
               const comment = new Comment({
                    body: req.body.comment.body,
                    author: {
                        username: authUser.username,
                        bio: authUser.bio,
                        image: authUser.image,
                        following: false
                    },
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    article: article
                });
                comment.id = comment._id;
                comment.save((err, comment) => {
                    console.log('Comment saved');
                    res.status(200).json({comment});
                    console.log(comment);
                });
            });

        })
    });
};



getComments = (req, res) => {
    console.log(req.params);
    Article.findOne({
        slug: req.params['slug']
    }, (err, article) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        Comment.find({
            'article': article._id
        }, (err, comments) => {
            if (err) {
                res.status(500).send(err);
                return;
            }
            res.status(200).send({comments});
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
                    console.log(comment);
                    console.log('comment deleted');
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