const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
    body: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    article: { type: mongoose.Schema.Types.ObjectId, ref: 'Article' },
    createdAt: Date,
    updatedAt: Date
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;