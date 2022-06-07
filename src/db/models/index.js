const mongoose = require('mongoose');

const db = {};
db.mongoose = mongoose;
db.user = require('./user.model');
db.article = require('./article.model');
db.comment = require('./comment.model');

module.exports = db;
