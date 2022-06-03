const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
    body: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    article: { type: mongoose.Schema.Types.ObjectId, ref: 'Article' },
},  { timestamps: true });

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;