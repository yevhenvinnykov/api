const db = require('../models');
const Article = db.article;
const { createError } = require('../utils/index');

checkIfArticleTitleIsUnique = async (req, res, next) => {
    try {
        const article = await Article.findOne({ title: req.body.article.title }).exec();
        if (!article) return next();
        res.status(400).send(createError('Article with this title already exists'));
    } catch (error) {
        res.status(500).send(createError('Something went wrong'));
    }
};

module.exports = {
    checkIfArticleTitleIsUnique
};