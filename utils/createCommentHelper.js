const db = require('../models');
const Comment = db.comment;

module.exports = (commentData, authorId, articleId) => {
    const comment = new Comment({
        body: commentData,
        author: authorId,
        article: articleId
    });
    comment.id = comment._id;
    return comment;
};