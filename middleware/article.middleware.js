const db = require('../models');
const Article = db.article;
const { createError } = require('../utils/index');

checkIfArticleTitleIsUnique = (req, res, next) => {
    Article.findOne({
        title: req.body.article.title
    }).exec((err, article) => {
        if (err) return res.status(500).send(createError('Something went wrong'));
        if (article) return res.status(400)
            .send(createError('Article with this title already exists'));
        next();
    });
};

module.exports = {
    checkIfArticleTitleIsUnique
};