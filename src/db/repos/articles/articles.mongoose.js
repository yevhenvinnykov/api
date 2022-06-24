const db = require('../../index');
const Article = db.article;
const UsersRepository = require('../users/users.repository');
const Normalizer = require('../normalizer');

const ArticlesMongoose = {
  async create(authUserId, articleData) {
    const article = await new Article({
      title: articleData.title,
      description: articleData.description,
      body: articleData.body,
      tagList: articleData.tagList,
      slug: articleData.title,
      author: authUserId,
    }).save();

    return Normalizer.article(article);
  },

  async update(articleId, updateData) {
    const article = await this.findOneBy('id', articleId, 'raw');

    for (const prop in updateData) {
      if (!(prop in article)) continue;
      article[prop] = updateData[prop];
      article.slug = article.title;
    }
    await article.save();
  },

  async like(authUserId, articleId) {
    const authUser = await UsersRepository.findOneBy('id', authUserId, ['favorites'], 'raw');
    const article = await this.findOneBy('id', articleId, 'raw');

    article.favoritesCount++;
    authUser.favorites.push(article.id);

    await Promise.all([article.save(), authUser.save()]);
  },

  async dislike(authUserId, articleId) {
    const authUser = await UsersRepository.findOneBy('id', authUserId, ['favorites'], 'raw');
    const article = await this.findOneBy('id', articleId, 'raw');
    const index = authUser.favorites.indexOf(article.id);

    article.favoritesCount--;
    authUser.favorites.splice(index, 1);

    await Promise.all([article.save(), authUser.save()]);
  },

  async delete(conditions) {
    return await Article.deleteOne(conditions).exec();
  },

  async findOneBy(field, value, normalizing) {
    field = field === 'id' ? '_id' : field;

    const article = await Article.findOne({[field]: value})
        .populate('author', 'username bio image following').exec();

    if (normalizing === 'raw') return article;
    return Normalizer.article(article);
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

    return articles.map((article) => Normalizer.article(article));
  },

  async countDocuments(conditions) {
    return await Article.countDocuments(conditions).exec();
  },
};

module.exports = ArticlesMongoose;
