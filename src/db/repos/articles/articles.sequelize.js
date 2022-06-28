const Article = require('../../models/sequelize/article.model');
const User = require('../../models/sequelize/user.model');
const UsersRepository = require('../users/users.repository');
const {Op} = require('sequelize');
const Normalizer = require('../normalizer');


const ArticlesMongoose = {
  async create(authUserId, articleData) {
    const createdArticle = await Article.create({
      title: articleData.title,
      description: articleData.description,
      body: articleData.body,
      tagList: articleData.tagList,
      slug: articleData.title,
      authorId: authUserId,
    });

    const article = await this.findOneBy('id', createdArticle.id);

    return article;
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
    const authUser = await UsersRepository.findOneBy('id', authUserId, ['favorites']);
    const article = await this.findOneBy('id', articleId, 'raw');

    authUser.favorites.push(article.id);

    await Article.update({
      favoritesCount: ++article.favoritesCount,
    }, {where: {id: article.id}});

    await User.update({
      favorites: authUser.favorites,
    }, {where: {id: authUserId}});
  },

  async dislike(authUserId, articleId) {
    const authUser = await UsersRepository.findOneBy('id', authUserId, ['favorites', 'id']);
    const article = await this.findOneBy('id', articleId, 'raw');
    const index = authUser.favorites.indexOf(article.id);

    authUser.favorites.splice(index, 1);

    await Article.update({
      favoritesCount: --article.favoritesCount,
    }, {where: {id: article.id}});

    await User.update({
      favorites: authUser.favorites,
    }, {where: {id: authUserId}});
  },

  async delete(conditions) {
    const deletedCount = await Article.destroy({where: conditions});

    return {deletedCount};
  },

  async findOneBy(field, value, normalizing) {
    const article = await Article.findOne({
      where: {[field]: value},
      include: [{
        model: User, as: 'author',
        attributes: ['username', 'bio', 'image', 'following', 'id'],
      }],
    });

    if (normalizing === 'raw') return article;

    return Normalizer.article(article);
  },

  async find(conditions, {limit, offset}) {
    if (conditions.tagList) {
      conditions = {tagList: {[Op.substring]: conditions.tagList}};
    }
    const articles = await Article.findAll({
      where: conditions,
      include: [{
        model: User, as: 'author',
        attributes: ['username', 'bio', 'image', 'following', 'id'],
      }],
      order: [['updatedAt', 'DESC']],
      offset: offset || 0,
      limit: limit || 5,
      subQuery: false,
    });

    return articles.map((article) => Normalizer.article(article));
  },

  async count(conditions) {
    if (conditions.tagList) {
      conditions = {tagList: {[Op.substring]: conditions.tagList}};
    }
    return await Article.count({where: conditions});
  },
};

module.exports = ArticlesMongoose;

