const db = require('../../index');
const Article = db.article;
const UsersRepository = require('../users/users.repository');

const ArticlesMongoose = {
  async create(authUserId, articleData) {
    return await new Article({
      title: articleData.title,
      description: articleData.description,
      body: articleData.body,
      tagList: articleData.tagList,
      slug: articleData.title,
      author: authUserId,
    }).save();
  },

  async update(article, updateData) {
    for (const prop in updateData) {
      if (!(prop in article)) continue;
      article[prop] = updateData[prop];
      article.slug = article.title;
    }
    await article.save();
    return article;
  },

  async like(authUserId, article) {
    const authUser = await UsersRepository.findOneBy('id', authUserId, ['favorites']);
    article.favoritesCount++;
    authUser.favorites.push(article.id);
    await Promise.all([article.save(), authUser.save()]);
  },

  async dislike(authUserId, article) {
    const authUser = await UsersRepository.findOneBy('id', authUserId, ['favorites']);
    const index = authUser.favorites.indexOf(article.id);
    article.favoritesCount--;
    authUser.favorites.splice(index, 1);
    await Promise.all([article.save(), authUser.save()]);
  },

  async delete(conditions) {
    return await Article.deleteOne(conditions).exec();
  },

  async findOneBy(field, value) {
    return Article.findOne({[field]: value})
        .populate('author', 'username bio image following').exec();
  },

  async find(conditions, {limit, offset}) {
    if (conditions.hasOwnProperty('authorId')) {
      conditions = {author: conditions.authorId};
    }
    const articles = await Article.find(conditions)
        .skip(offset)
        .limit(limit)
        .sort([['updatedAt', 'descending']])
        .populate('author', 'username bio image following')
        .exec();

    return articles;
  },

  async countDocuments(conditions) {
    return await Article.countDocuments(conditions).exec();
  },
};

module.exports = ArticlesMongoose;
