const db = require('../models');
const Article = db.article;

checkIfArticleTitleIsUnique = (req, res, next) => {
    Article.findOne({
        title: req.body.article.title
    }).exec((err, article) => {
        if (err) return res.status(500).send({ error: err });
        if (article) return res.status(400).send({ error: 'Article with this title already exists' });
        next();
    });
};

module.exports = {
    checkIfArticleTitleIsUnique
};