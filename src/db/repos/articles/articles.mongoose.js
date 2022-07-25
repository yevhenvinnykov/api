const Article = require('../../models/mongoose/article.model');
const UsersRepository = require('../users/index');
const Normalizer = require('../normalizer');

const ArticlesMongoose = {
  async create(authUserId, articleData) {
    const createdArticle = await new Article({
      title: articleData.title,
      description: articleData.description,
      body: articleData.body,
      image: articleData.image,
      tagList: articleData.tagList,
      slug: articleData.title.replaceAll(' ', '-'),
      author: authUserId,
    }).save();

    const article = await this.findOneBy('id', createdArticle.id);

    return article;
  },

  async update(articleId, updateData) {
    const article = await this.findOneBy('id', articleId, 'raw');

    for (const prop in updateData) {
      if (!(prop in article)) continue;
      article[prop] = updateData[prop];
      article.slug = article.title.replaceAll(' ', '-');
    }
    await article.save();

    return Normalizer.article(article);
  },

  async like(authUserId, articleId) {
    const authUser = await UsersRepository.findOneBy(
      'id',
      authUserId,
      ['favorites'],
      'raw'
    );
    const article = await this.findOneBy('id', articleId, 'raw');

    article.favoritesCount++;
    authUser.favorites.push(article.id);

    await Promise.all([article.save(), authUser.save()]);
  },

  async dislike(authUserId, articleId) {
    const authUser = await UsersRepository.findOneBy(
      'id',
      authUserId,
      ['favorites'],
      'raw'
    );
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

    const article = await Article.findOne({ [field]: value })
      .populate('author', 'username bio image following')
      .exec();

    if (normalizing === 'raw') return article;
    return Normalizer.article(article);
  },

  async find(conditions, { limit, offset }) {
    const articles = await Article.find(conditions)
      .skip(offset)
      .limit(limit)
      .sort([['updatedAt', 'descending']])
      .populate('author', 'username bio image following')
      .exec();

    return articles.map((article) => Normalizer.article(article));
  },

  async count(conditions) {
    return await Article.countDocuments(conditions).exec();
  },
};

module.exports = ArticlesMongoose;
