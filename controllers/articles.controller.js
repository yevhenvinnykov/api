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
                author: user._id
            }).save((err, article) => {
                if (err) {
                    res.status(500).send({ error: err });
                    return;
                }
                res.status(200).send({ article });
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
                res.status(200).send({ article });
            });
        });
    });
};



getArticle = (req, res) => {
    let token = req.headers['x-access-token'];
    if (!token) {
        Article.findOne({
            slug: req.params['slug']
        }).populate('author').exec().then((article) => {
            if (!article) {
                res.status(404).send({ error: 'Article not found' });
                return;
            }
            res.status(200).send({ article: { ...article._doc, author: { ...article.author._doc, following: false } } });
        });
        return;
    }
    jwt.verify(token, process.env.JWT_SECRET, {
        expiresIn: 3600
    }, (err, decoded) => {

        User.findOne({
            _id: decoded.id
        }, (err, authUser) => {
            Article.findOne({
                slug: req.params['slug']
            }).populate('author').exec().then((article) => {
                if (!article) {
                    res.status(404).send({ error: 'Article not found' });
                    return;
                }
                if (authUser) {
                    User.findOne({
                        username: article.author.username
                    }, (err, user) => {
                        let resultArticle;
                        if (authUser.following.find(id => id.equals(user._id))) {
                            resultArticle = { ...article._doc, author: { ...article.author._doc, following: true } };
                        } else {
                            resultArticle = { ...article._doc, author: { ...article.author._doc, following: false } };
                        }
                        if (authUser.favorites.find(id => id.equals(article._id))) {
                            resultArticle = { ...resultArticle, favorited: true };
                        } else {
                            resultArticle = { ...resultArticle, favorited: false };
                        }
                        res.status(200).send({ article: resultArticle });
                        return;
                    });
                    return;
                }
                res.status(200).send({ article: { ...article._doc, author: { ...article.author, following: false } } });
            });
        });

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
        }, async (err, authUser) => {
            if (err) {
                res.status(500).send({ error: err });
                return;
            }
            if (!authUser) {
                res.status(404).send({ error: 'User not found' });
                return;
            }
            const result = await Article.deleteOne({
                slug: req.params.slug,
                'author': authUser._id
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
                    res.status(200).send({ article: { ...article._doc, favorited: true } });
                    return;
                };
                article.favoritesCount++;
                article.save();
                user.favorites.push(article._id);
                user.save();
                res.status(200).send({ article: { ...article._doc, favorited: true } });
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
                    res.status(200).send({ article: { ...article._doc, favorited: false } });
                    return;
                };
                article.favoritesCount--;
                article.save();
                const index = user.favorites.indexOf(article._id);
                user.favorites.splice(index, 1);
                user.save();
                res.status(200).send({ article: { ...article._doc, favorited: false } });
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
        }, async (err, authUser) => {
            if (err) {
                res.status(500).send({ error: err });
                return;
            }
            if (!authUser) {
                res.status(404).send({ error: 'User not found' });
                return;
            }
            const followedArticles = [];
            let articlesCount = 0;
            for (const u of authUser.following) {
                await Article.find({
                    'author': u
                })
                    .populate('author')
                    .skip(req.query['offset'] || 0)
                    .limit(req.query['limit'] || 5)
                    .exec()
                    .then(articles => {
                        followedArticles.push(...articles);
                    });
                await Article.countDocuments({ 'author': u }).exec().then((count) => {
                    articlesCount += count;
                });
            }

            const articlesWithFavoriteInfo = [];
            for (const article of followedArticles) {
                if (authUser.favorites.find(id => id.equals(article._id))) {
                    articlesWithFavoriteInfo.push({ ...article._doc, favorited: true });
                } else {
                    articlesWithFavoriteInfo.push({ ...article._doc, favorited: false });
                }
            }
            res.status(200).send({ articles: articlesWithFavoriteInfo, articlesCount });
        });

    });
};

getArticles = (req, res) => {
    const query = {};
    if (req.query['author']) {
        User.findOne({
            username: req.query.author
        }, (err, user) => {
            if (user) {
                query['author'] = user._id;
            }
        });
    }
    if (req.query['favorited']) {
        User.findOne({
            username: req.query.favorited
        }, (err, user) => {
            if (user) {
                query._id = { $in: user.favorites };
            }
        });
    }
    if (req.query['tag']) {
        query['tagList'] = req.query['tag'];
    }
    let token = req.headers['x-access-token'];
    if (!token) {
        Article
            .find(query)
            .skip(req.query['offset'] || 0)
            .limit(req.query['limit'] || 5)
            .populate('author')
            .exec()
            .then(articles => {
                Article.countDocuments(query).exec((err, count) => {
                    res
                        .status(200)
                        .send({
                            articles,
                            articlesCount: count
                        });
                });
            });
        return;
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
            Article.find(query)
                .skip(req.query['offset'] || 0)
                .limit(req.query['limit'] || 5)
                .populate('author')
                .exec()
                .then(articles => {
                    const articlesWithFavoriteInfo = [];
                    for (const article of articles) {
                        if (user.favorites.find(id => id.equals(article._id))) {
                            articlesWithFavoriteInfo.push({ ...article._doc, favorited: true });
                        } else {
                            articlesWithFavoriteInfo.push({ ...article._doc, favorited: false });
                        }
                    }
                    Article.countDocuments(query).exec((err, count) => {
                        res
                            .status(200)
                            .send({
                                articles: articlesWithFavoriteInfo,
                                articlesCount: count
                            });
                    });
                });
        });

    });
};

getTags = (req, res) => {
    Article.find({}, (err, articles) => {
        const tags = new Set();
        for (const article of articles) {
            tags.add(...article.tagList);
        }
        res.status(200).send({ tags: [...tags] });
    });
};

module.exports = {
    createArticle,
    updateArticle,
    getArticle,
    deleteArticle,
    likeArticle,
    dislikeArticle,
    getArticlesFromFollowedUsers,
    getArticles,
    getTags
};