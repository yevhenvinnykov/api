require('dotenv').config();
const User = process.env.ORM === 'MONGOOSE' ?
require('../../db/models/mongoose/user.model') :
require('../../db/models/sequelize/user.model');


const Article = process.env.ORM === 'MONGOOSE' ?
require('../../db/models/mongoose/article.model') :
require('../../db/models/sequelize/article.model');

const Comment = process.env.ORM === 'MONGOOSE' ?
require('../../db/models/mongoose/comment.model') :
require('../../db/models/sequelize/comment.model');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


const MockCreator = {
  async createArticleMock(title) {
    const article = await new Article({
      title,
      description: 'Lorem ipsum',
      body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
      tagList: ['lorem'],
    });
    article.slug = article.title;
    await article.save();
    return article;
  },

  async createUserMock(username) {
    const user = await new User({
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
    const comment = await new Comment({
      body,
      author: authorId,
      article: articleId,
    });
    comment.save();
    return comment;
  },
};

module.exports = MockCreator;
