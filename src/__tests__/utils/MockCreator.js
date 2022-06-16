const User = require('../../db/models/user.model');
const Article = require('../../db/models/article.model');
const Comment = require('../../db/models/comment.model');

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
    process.env.JWT_SECRET = 'secret';
    // Have no idea why, but it won't work without setting the env variable
    const user = await new User({
      username,
      email: `${username}@email.com`.toLowerCase(),
      password: bcrypt.hashSync(`${username}Password1`, 8),
    });
    const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: 3600});
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
