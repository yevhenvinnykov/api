const User = require('../../../db/models/sequelize/user.model');
const Article = require('../../../db/models/sequelize/article.model');
const Comment = require('../../../db/models/sequelize/comment.model');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


const SqlMockCreator = {
  async createArticleMock(title, authorId) {
    const article = await Article.create({
      title,
      description: 'Lorem ipsum',
      body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
      tagList: ['lorem'],
      authorId: authorId,
      slug: title,
    });
    await article.save();

    return article;
  },

  async createUserMock(username) {
    const user = await User.create({
      username,
      email: `${username}@email.com`.toLowerCase(),
      password: bcrypt.hashSync(`${username}Password1`, 8),
    });
    const token = jwt.sign({id: user.id}, process.env.JWT_DEBUG_SECRET, {expiresIn: 3600});
    user.token = token;
    await user.save();

    return user;
  },

  async createCommentMock({body, authorId, articleId}) {
    const comment = await Comment.create({
      body,
      authorId,
      articleId,
    });

    return comment;
  },
};

module.exports = SqlMockCreator;
