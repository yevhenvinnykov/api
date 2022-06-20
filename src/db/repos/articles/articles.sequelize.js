const Article = require('../../models/sequelize/article.model');
const User = require('../../models/sequelize/user.model');
const {Op} = require('sequelize');


const ArticlesMongoose = {
  async create(authUserId, articleData) {
    const article = await Article.create({
      title: articleData.title,
      description: articleData.description,
      body: articleData.body,
      tagList: articleData.tagList,
      slug: articleData.title,
      authorId: authUserId,
    });
    return article;
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

  async delete(conditions) {
    const deletedCount = await Article.destroy({where: conditions});
    return {deletedCount};
  },

  async findOneBy(field, value) {
    return Article.findOne({
      where: {[field]: value},
      include: [{
        model: User, as: 'author',
        attributes: ['username', 'bio', 'image', 'following', 'id'],
      }],
    });
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
      offset: offset || 0,
      limit: limit || 5,
      subQuery: false,
    });
    return articles;
  },

  async countDocuments(conditions) {
    if (conditions.tagList) {
      conditions = {tagList: {[Op.substring]: conditions.tagList}};
    }
    return await Article.count({where: conditions});
  },
};

module.exports = ArticlesMongoose;

