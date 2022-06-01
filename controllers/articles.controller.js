const db = require('../models');
const Article = db.article;
const User = db.user;
const {
    createArticleHelper,
    updateArticleHelper,
    addUserInfoToArticle,
    addFavoriteInfoToArticles,
    createQueryParams
} = require('../utils/index');

createArticle = (req, res) => {
    User.findOne({
        _id: req.userId
    }, (err, user) => {
        if (err) {
            return res.status(500).send({ error: err });
        }
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }
        createArticleHelper(req.body.article, user._id)
            .save((err, article) => {
                if (err) {
                    return res.status(500).send({ error: err });
                }
                res.status(200).send({ article });
            });
    });
};

updateArticle = (req, res) => {
    Article.findOne({
        slug: req.params['slug']
    }, (err, article) => {
        if (err) {
            return res.status(500).send({ error: err });
        }
        if (!article) {
            return res.status(404).send({ error: 'Article not found' });
        }
        if (!article.author.equals(req.userId)) {
            return res.status(401).send({ error: 'Unauthorized' });
        }
        updateArticleHelper(article, req.body.article)
            .save((err, article) => {
                if (err) {
                    return res.status(500).send({ error: err });
                }
                res.status(200).send({ article });
            });
    });
};

getArticle = (req, res) => {
    Article.findOne({
        slug: req.params['slug']
    })
        .populate('author', 'username bio image following')
        .exec()
        .then((article) => {
            if (!article) {
                return res.status(404).send({ error: 'Article not found' });
            }
            if (!req.userId) {
                const responseArticle = {
                    article: {
                        ...article._doc,
                        author: { ...article.author._doc, following: false }
                    }
                };
                return res.status(200).send(responseArticle);
            }
            User.findOne({
                _id: req.userId
            }, (err, authUser) => {
                if (err) {
                    return res.status(500).send({ error: err });
                }
                if (authUser) {
                    const resultArticle = addUserInfoToArticle(authUser, article);
                    res.status(200).send({ article: resultArticle });
                }
            });
        });
};


deleteArticle = (req, res) => {
    User.findOne({
        _id: req.userId
    }, async (err, authUser) => {
        if (err) {
            return res.status(500).send({ error: err });
        }
        if (!authUser) {
            return res.status(404).send({ error: 'User not found' });
        }
        const result = await Article.deleteOne({
            slug: req.params.slug,
            author: authUser._id
        });
        if (!result.deletedCount) {
            return res.status(404).send({ error: 'Article not found' });
        }
        res.status(200).send({});
    });
};

likeArticle = (req, res) => {
    User.findOne({
        _id: req.userId
    }, (err, user) => {
        if (err) {
            return res.status(500).send({ error: err });
        }
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }
        Article.findOne({
            slug: req.params.slug
        }, (err, article) => {
            if (err) {
                return res.status(500)
                    .send({ error: err });
            }
            if (user.favorites.find(id => id.equals(article._id))) {
                return res.status(200)
                    .send({ article: { ...article._doc, favorited: true } });
            };
            article.favoritesCount++;
            article.save();
            user.favorites.push(article._id);
            user.save();
            res.status(200)
                .send({ article: { ...article._doc, favorited: true } });
        });
    });
};

dislikeArticle = (req, res) => {
    User.findOne({
        _id: req.userId
    }, (err, user) => {
        if (err) {
            return res.status(500).send({ error: err });
        }
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }
        Article.findOne({
            slug: req.params.slug
        }, (err, article) => {
            if (err) {
                return res.status(500)
                    .send({ error: err });
            }
            const index = user.favorites.indexOf(article._id);
            if (index === -1) {
                return res.status(200)
                    .send({ article: { ...article._doc, favorited: false } });
            };
            article.favoritesCount--;
            article.save();
            user.favorites.splice(index, 1);
            user.save();
            res.status(200)
                .send({ article: { ...article._doc, favorited: false } });
        });
    });
};

getArticlesFromFollowedUsers = (req, res) => {
    User.findOne({
        _id: req.userId
    }, async (err, authUser) => {
        if (err) {
            return res.status(500).send({ error: err });
        }
        if (!authUser) {
            return res.status(404).send({ error: 'User not found' });
        }
        const followedArticles = [];
        let articlesCount = 0;
        for (const userId of authUser.following) {
            await Article.find({
                'author': userId
            })
                .populate('author', 'username bio image following')
                .skip(req.query['offset'] || 0)
                .limit(req.query['limit'] || 5)
                .exec()
                .then(articles => {
                    followedArticles.push(...articles);
                });
            await Article.countDocuments({ 'author': userId })
                .exec()
                .then((count) => {
                    articlesCount += count;
                });
        }
        const articlesWithFavoriteInfo = addFavoriteInfoToArticles(followedArticles, authUser);
        res.status(200)
            .send({ articles: articlesWithFavoriteInfo, articlesCount });
    });
};

getArticles = async (req, res) => {
    let queryParams = await createQueryParams(req.query);
    Article.find(queryParams)
        .skip(req.query['offset'] || 0)
        .limit(req.query['limit'] || 5)
        .populate('author', 'username bio image following')
        .exec()
        .then(articles => {
            if (req.userId) {
                User.findOne({
                    _id: req.userId
                }, (err, authUser) => {
                    if (err) {
                        return res.status(500).send({ error: err });
                    }
                    if (!authUser) {
                        return res.status(404).send({ error: 'User not found' });
                    }
                    articles = addFavoriteInfoToArticles(articles, authUser);
                });
            }
            Article.countDocuments(queryParams).exec((err, articlesCount) => {
                res.status(200)
                    .send({ articles, articlesCount });
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