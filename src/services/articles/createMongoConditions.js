const UsersRepository = require('../../db/repos/users/users.repository');

module.exports = async (query) => {
  const queryConditions = {};

  if (query.author) {
    const author = await UsersRepository.findOneBy('username', query.author, ['id']);
    queryConditions.author = author.id;
  }

  if (query.favorited) {
    const user = await UsersRepository.findOneBy('username', query.favorited, ['favorites']);
    queryConditions._id = {$in: user.favorites};
  }

  if (query.tag) {
    queryConditions.tagList = query.tag;
  }

  if (query.feedFor) {
    const authUser = await UsersRepository.findOneBy('id', query.feedFor, ['following']);
    queryConditions.author = {$in: authUser.following};
  }

  return queryConditions;
};
