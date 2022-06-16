const mongoose = require('mongoose');
const User = require('../../db/models/user.model');
const Comment = require('../../db/models/comment.model');
const Article = require('../../db/models/article.model');
const app = require('../index');


const TestInitializer = {
  async initializeServer() {
    await this.clearDB();
    return app.listen(3001);
  },

  async close(server) {
    await this.clearDB();
    await mongoose.connection.close();
    await server.close();
  },

  async clearDB() {
    await User.deleteMany({});
    await Article.deleteMany({});
    await Comment.deleteMany({});
  },
};

module.exports = TestInitializer;
