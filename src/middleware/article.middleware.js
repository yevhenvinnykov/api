const db = require('../models');
const Article = db.article;
const { ErrorHandler, BadRequestError } = require('../utils/errorHandler');

checkIfArticleTitleIsUnique = async (req, res, next) => {
    try {
        const article = await Article.findOne({ title: req.body.article.title }).exec();
        if (article) throw new BadRequestError('Article with this title already exists');
        next();
    } catch (error) {
        ErrorHandler.catchError(res, error);
    }
};

module.exports = {
    checkIfArticleTitleIsUnique
};