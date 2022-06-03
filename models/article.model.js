const mongoose = require('mongoose');

const articleSchema = mongoose.Schema({
    slug: String,
    title: String,
    description: String,
    body: String,
    tagList: [String],
    createdAt: { type: Date, default: new Date() },
    updatedAt: { type: Date, default: new Date() },
    favorited: { type: Boolean, default: false },
    favoritesCount: { type: Number, default: 0 },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;



