const db = require('../models');
const Article = db.article;
const User = db.user;
const jwt = require('jsonwebtoken');

createArticle = (req, res) => {
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
        }, (err, user) => {
            if (err) {
                res.status(500).send({ error: err });
                return;
            }
            if (!user) {
                res.status(404).send({ error: 'User not found' });
                return;
            }
            new Article({
                title: req.body.article.title,
                description: req.body.article.description,
                body: req.body.article.body,
                tagList: req.body.article.tagList,
                slug: req.body.article.title,
                createdAt: new Date(),
                updatedAt: new Date(),
                favorited: false,
                favoritesCount: 0,
                author: {
                    username: user.username,
                    bio: user.bio,
                    image: user.image,
                    following: false,
                }
            }).save((err, article) => {
                if (err) {
                    res.status(500).send({ error: err });
                    return;
                }
                article.save(err => {
                    if (err) {
                        res.status(500).send({ error: err });
                        return;
                    }
                    res.status(200).send(article);
                });
            });
        });
    });
};


updateArticle = (req, res) => {
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
        Article.findOne({
            slug: req.params['slug']
        }, (err, article) => {
            if (err) {
                res.status(500).send({ error: err });
                return;
            }
            if (!article) {
                res.status(404).send({ error: 'Article not found' });
                return;
            }
            for (const prop in req.body.article) {
                if (prop === 'title') {
                    article.slug = req.body.article[prop];
                }
                article[prop] = req.body.article[prop];
            }
            article.updatedAt = new Date();
            article.save((err, article) => {
                if (err) {
                    res.status(500).send({ error: err });
                    return;
                }
                res.status(200).send({article});
            });
        });
    });
};



getArticle = (req, res) => {
    Article.findOne({
        slug: req.params['slug']
    }, (err, article) => {
        if (err) {
            res.status(500).send({ error: err });
            return;
        }
        if (!article) {
            res.status(404).send({ error: 'Article not found' });
            return;
        }
        res.status(200).send({article});
    });
};


deleteArticle = (req, res) => {
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
        }, async (err, user) => {
            if (err) {
                res.status(500).send({ error: err });
                return;
            }
            if (!user) {
                res.status(404).send({ error: 'User not found' });
                return;
            }
            const result = await Article.deleteOne({
                slug: req.params.slug,
                'author.username': user.username
            });
            if (!result.deletedCount) {
                res.status(404).send({ error: 'Article not found' });
                return;
            }
            res.status(200).send({});
        });
    });
};

likeArticle = (req, res) => {
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
        }, (err, user) => {
            if (err) {
                res.status(500).send({ error: err });
                return;
            }
            if (!user) {
                res.status(404).send({ error: 'User not found' });
                return;
            }
            Article.findOne({
                slug: req.params.slug
            }, (err, article) => {
                if (err) {
                    res.status(500).send({ error: err });
                    return;
                }
                if (user.favorites.find(id => id.equals(article._id))) {
                    res.status(200).send({article});
                    return;
                };
                article.favoritesCount++;
                // article.favorited = true;
                article.save();
                user.favorites.push(article._id);
                user.save();
                res.status(200).send({article});
                console.log(article);
            });
        });
    });
};


dislikeArticle = (req, res) => {
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
        }, (err, user) => {
            if (err) {
                res.status(500).send({ error: err });
                return;
            }
            if (!user) {
                res.status(404).send({ error: 'User not found' });
                return;
            }
            Article.findOne({
                slug: req.params.slug
            }, (err, article) => {
                if (err) {
                    res.status(500).send({ error: err });
                    return;
                }
                if (!user.favorites.find(id => id.equals(article._id))) {
                    res.status(200).send({article});
                    return;
                };
                article.favoritesCount--;
                article.save();
                const index = user.favorites.indexOf(article._id);
                user.favorites.splice(index, 1);
                user.save();
                res.status(200).send({article});
            });
        });
    });
};

getArticlesFromFollowedUsers = (req, res) => {
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
        }, async (err, user) => {
            if (err) {
                res.status(500).send({ error: err });
                return;
            }
            if (!user) {
                res.status(404).send({ error: 'User not found' });
                return;
            }
            const result = [];
            for (const u of user.following) {
                const articles = await Article.find({
                    'author._id': u
                });
                result.push(articles);
            }
            res.status(200).send(result);
        })



    });
};

module.exports = {
    createArticle,
    updateArticle,
    getArticle,
    deleteArticle,
    likeArticle,
    dislikeArticle,
    getArticlesFromFollowedUsers
};