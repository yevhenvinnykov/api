const User = require('../../../db/models/mongoose/user.model');
const Article = require('../../../db/models/mongoose/article.model');
const Comment = require('../../../db/models/mongoose/comment.model');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const MongoMockCreator = {
  async createArticleMock(title, author) {
    const article = await new Article({
      title,
      description: 'Lorem ipsum',
      body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
      tagList: ['lorem'],
      slug: title.replaceAll(' ', '-'),
      author,
    });
    await article.save();

    return article;
  },

  async createUserMock(username) {
    const user = await new User({
      username,
      email: `${username}@email.com`.toLowerCase(),
      password: bcrypt.hashSync(`${username}Password1`, 8),
    });
    const token = jwt.sign({ id: user.id }, process.env.JWT_DEBUG_SECRET, {
      expiresIn: 3600,
    });
    user.token = token;
    await user.save();

    return user;
  },

  async createCommentMock({ body, authorId, articleId }) {
    const comment = await new Comment({
      body,
      author: authorId,
      article: articleId,
    });
    comment.save();

    return comment;
  },
};

module.exports = MongoMockCreator;
