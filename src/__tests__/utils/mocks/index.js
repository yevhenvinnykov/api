require('dotenv').config();
const MockService =
  process.env.ORM === 'MONGOOSE'
    ? require('./MongoMockCreator')
    : require('./SqlMockCreator');

const MockCreator = {
  async createArticleMock(title, author) {
    return await MockService.createArticleMock(title, author);
  },

  async createUserMock(username) {
    return await MockService.createUserMock(username);
  },

  async createCommentMock(data) {
    return await MockService.createCommentMock(data);
  },
};

module.exports = MockCreator;
