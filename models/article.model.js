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
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;



