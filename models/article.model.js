const mongoose = require('mongoose');

const articleSchema = mongoose.Schema({
    slug: String,
    title: String,
    description: String,
    body: String,
    tagList: [String],
    createdAt: Date,
    updatedAt: Date,
    favorited: Boolean,
    favoritesCount: Number,
    author: {
        username: String,
        bio: String,
        image: String,
        following: Boolean
    }
});

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;



