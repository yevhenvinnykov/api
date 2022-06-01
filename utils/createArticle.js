const db = require('../models');
const Article = db.article;

module.exports = (articleData, userId) => {
    return new Article({
        title: articleData.title,
        description: articleData.description,
        body: articleData.body,
        tagList: articleData.tagList,
        slug: articleData.title,
        createdAt: new Date(),
        updatedAt: new Date(),
        favorited: false,
        favoritesCount: 0,
        author: userId
    });
};