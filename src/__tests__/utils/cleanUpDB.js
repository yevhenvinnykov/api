const User = require('../../db/models/user.model');
const Comment = require('../../db/models/comment.model');
const Article = require('../../db/models/article.model');

module.exports = async () => {
  await User.deleteMany({});
  await Article.deleteMany({});
  await Comment.deleteMany({});
};
