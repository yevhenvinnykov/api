const UsersRepository = require('../../../db/repos/users/index');
const { Op } = require('sequelize');

module.exports = async (query) => {
  const queryConditions = {};

  if (query.author) {
    const author = await UsersRepository.findOneBy('username', query.author, [
      'id',
    ]);
    queryConditions.authorId = author.id;
  }

  if (query.favorited) {
    const user = await UsersRepository.findOneBy('username', query.favorited, [
      'favorites',
    ]);
    queryConditions.id = { [Op.in]: user.favorites };
  }

  if (query.tag) {
    queryConditions.tagList = query.tag;
  }

  if (query.feedFor) {
    const authUser = await UsersRepository.findOneBy('id', query.feedFor, [
      'following',
    ]);
    queryConditions.authorId = { [Op.in]: authUser.following };
  }

  return queryConditions;
};
