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
    let article;
    if (process.env.ORM === 'MONGOOSE') {
      article = await new Article({
        title,
        description: 'Lorem ipsum',
        body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
        tagList: ['lorem'],
      });
      article.slug = article.title;
      await article.save();
    }
    if (process.env.ORM === 'SEQUELIZE') {
      const author = await this.createUserMock('Author');
      article = await Article.create({
        title,
        description: 'Lorem ipsum',
        body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
        tagList: ['lorem'],
        authorId: author.id,
      });
      article.slug = article.title;
      await article.save();
    }
    return article;
  },

  async createUserMock(username) {
    let user;
    if (process.env.ORM === 'MONGOOSE') {
      user = await new User({
        username,
        email: `${username}@email.com`.toLowerCase(),
        password: bcrypt.hashSync(`${username}Password1`, 8),
      });
    }

    if (process.env.ORM === 'SEQUELIZE') {
      user = await User.create({
        username,
        email: `${username}@email.com`.toLowerCase(),
        password: bcrypt.hashSync(`${username}Password1`, 8),
      });
    }
    const token = jwt.sign({id: user.id}, process.env.JWT_DEBUG_SECRET, {expiresIn: 3600});
    user.token = token;
    await user.save();
    return user;
  },

  async createCommentMock({body, authorId, articleId}) {
    let comment;
    if (process.env.ORM === 'MONGOOSE') {
      comment = await new Comment({
        body,
        author: authorId,
        article: articleId,
      });
      comment.save();
    }

    if (process.env.ORM === 'SEQUELIZE') {
      comment = await Comment.create({
        body,
        authorId,
        articleId,
      });
    }
    return comment;
  },
};

module.exports = MockCreator;
