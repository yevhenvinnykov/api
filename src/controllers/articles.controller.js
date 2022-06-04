const db = require('../models');
const Article = db.article;
const User = db.user;
const {
    createArticleHelper,
    updateArticleHelper,
    addUserInfoToArticle,
    addFavoriteInfoToArticles,
    createQueryParams,
    createError
} = require('../utils/index');

createArticle = async (req, res) => {
    try {
        const authUser = await User.findOne({ _id: req.userId }).exec();
        if (!authUser) return res.status(404).send(createError('User not found'));
        const article = await createArticleHelper(req.body.article, authUser._id);
        res.status(200).send({ article });
    } catch (error) {
        handleError(error, res);
    }
};

updateArticle = async (req, res) => {
    try {
        const article = await Article.findOne({ slug: req.params['slug'] }).exec();
        if (!article) return res.status(404).send(createError('Article not found'));
        if (!article.author.equals(req.userId)) return res.status(401)
            .send(createError('You are not authorized'));
        const updatedArticle = await updateArticleHelper(article, req.body.article);
        res.status(200).send({ article: updatedArticle });
    } catch (error) {
        handleError(error, res);
    }
};

getArticle = async (req, res) => {
    try {
        const article = await Article.findOne({ slug: req.params['slug'] })
            .populate('author', 'username bio image following').exec();
        if (!article) return res.status(404).send(createError('Article not found'));
        const authUser = await User.findOne({ _id: req.userId }).exec();
        const articleWithUserInfo = addUserInfoToArticle(authUser, article);
        res.status(200).send({ article: articleWithUserInfo });

    } catch (error) {
        handleError(error, res);
    }
};


deleteArticle = async (req, res) => {
    try {
        const authUser = await User.findOne({ _id: req.userId }).exec();
        if (!authUser) return res.status(404).send(createError('User not found'));
        const { deletedCount } = await Article.deleteOne({
            slug: req.params.slug,
            author: authUser._id
        });
        if (deletedCount) return res.status(200).send({});
        res.status(404).send(createError('Article not found'));
    } catch (error) {
        handleError(error, res);
    }
};

likeArticle = async (req, res) => {
    try {
        const authUser = await User.findOne({ _id: req.userId }).exec();
        const article = await Article.findOne({ slug: req.params.slug }).exec();
        if (!authUser || !article) return res.status(404).send(createError('User or article not found'));
        if (authUser.favorites.find(id => id.equals(article._id))) return res
            .status(200).send({ article: { ...article._doc, favorited: true } });
        article.favoritesCount++;
        await article.save();
        authUser.favorites.push(article._id);
        await authUser.save();
        res.status(200).send({ article: { ...article._doc, favorited: true } });
    } catch (error) {
        handleError(error, res);
    }
};

dislikeArticle = async (req, res) => {
    try {
        const authUser = await User.findOne({ _id: req.userId }).exec();
        const article = await Article.findOne({ slug: req.params.slug }).exec();
        if (!authUser || !article) return res.status(404).send(createError('User or article not found'));
        const index = authUser.favorites.indexOf(article._id);
        if (index === -1) return res.send({ article: { ...article._doc, favorited: false } });
        article.favoritesCount--;
        await article.save();
        authUser.favorites.splice(index, 1);
        await authUser.save();
        res.status(200).send({ article: { ...article._doc, favorited: false } });
    } catch (error) {
        handleError(error, res);
    }
};

getArticlesFromFollowedUsers = async (req, res) => {
    try {
        const authUser = await User.findOne({ _id: req.userId }).exec();
        if (!authUser) return res.status(404).send(createError('User not found'));
        const followedArticles = [];
        let articlesCount = 0;
        for (const userId of authUser.following) {
            const articles = await Article.find({ 'author': userId })
                .populate('author', 'username bio image following')
                .sort([['updatedAt', 'descending']])
                .exec();
            const count = await Article.countDocuments({ 'author': userId }).exec();
            followedArticles.push(...articles);
            articlesCount += count;
        }
        const start = +req.query.offset || 0;
        const end = +req.query.limit + start || 5;
        const articlesWithFavoriteInfo = addFavoriteInfoToArticles(followedArticles.slice(start, end), authUser);
        res.status(200).send({ articles: articlesWithFavoriteInfo, articlesCount });
    } catch (error) {
        handleError(error, res);
    }
};

getArticles = async (req, res) => {
    try {
        const queryParams = await createQueryParams(req.query);
        let articles = await Article.find(queryParams)
            .skip(req.query['offset'] || 0)
            .limit(req.query['limit'] || 5)
            .sort([['updatedAt', 'descending']])
            .populate('author', 'username bio image following')
            .exec();
        const articlesCount = await Article.countDocuments(queryParams).exec();
        if (!req.userId) return res.status(200).send({ articles, articlesCount });
        const authUser = await User.findOne({ _id: req.userId }).exec();
        if (!authUser) return res.status(404).send(createError('User not found'));
        articles = addFavoriteInfoToArticles(articles, authUser);
        res.status(200).send({ articles, articlesCount });
    } catch (error) {
        handleError(error, res);
    }
};

getTags = async (req, res) => {
    try {
        const articles = await Article.find().exec();
        const tags = new Set();
        for (const article of articles) {
            article.tagList.forEach(tag => tags.add(tag));
        }
        res.status(200).send({ tags: [...tags] });
    } catch (error) {
        handleError(error, res);
    }
};

handleError = (error, res) => {
    res.status(500).send(createError('Something went wrong'));
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