const db = require('../../index');
const Article = db.article;

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

  async delete(conditions) {
    return await Article.deleteOne(conditions).exec();
  },

  async findOneBy(field, value) {
    return Article.findOne({[field]: value})
        .populate('author', 'username bio image following').exec();
  },

  async find(condtions, {limit, offset}) {
    return await Article.find(condtions)
        .skip(offset)
        .limit(limit)
        .sort([['updatedAt', 'descending']])
        .populate('author', 'username bio image following')
        .exec();
  },

  async countDocuments(conditions) {
    return await Article.countDocuments(conditions).exec();
  },
};

module.exports = ArticlesMongoose;
