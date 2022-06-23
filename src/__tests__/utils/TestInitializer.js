require('dotenv').config();
const mongoose = require('mongoose');
const User = process.env.ORM === 'MONGOOSE' ?
require('../../db/models/mongoose/user.model') :
require('../../db/models/sequelize/user.model');

const Article = process.env.ORM === 'MONGOOSE' ?
require('../../db/models/mongoose/article.model') :
require('../../db/models/sequelize/article.model');

const Comment = process.env.ORM === 'MONGOOSE' ?
require('../../db/models/mongoose/comment.model') :
require('../../db/models/sequelize/comment.model');

const app = require('../index');


const TestInitializer = {
  async initializeServer() {
    await this.clearDB();
    return app;
  },

  async finish() {
    await this.clearDB();
    await mongoose.connection.close();
  },

  async clearDB() {
    if (process.env.ORM === 'MONGOOSE') {
      await User.deleteMany({});
      await Article.deleteMany({});
      await Comment.deleteMany({});
    }
    if (process.env.ORM === 'SEQUELIZE') {
      await User.destroy({
        where: {},
      });
      await Article.destroy({
        where: {},
      });
      await Comment.destroy({
        where: {},
      });
    }
  },
};

module.exports = TestInitializer;
