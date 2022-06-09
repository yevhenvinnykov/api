const db = require('./models');
const Article = db.article;

class ArticlesRepository {
  static async create(authUserId, articleData) {
    return await new Article({
      title: articleData.title,
      description: articleData.description,
      body: articleData.body,
      tagList: articleData.tagList,
      slug: articleData.title,
      author: authUserId,
    }).save();
  }

  static async update(article, updateData) {
    for (const prop in updateData) {
      if (article.hasOwnProperty(prop)) {
        article[prop] = updateData[prop];
        article.slug = article.title;
      }
    }
    await article.save();
    return article;
  }

  static async delete(conditions) {
    return await Article.deleteOne(conditions).exec();
  }

  static async findOneBy(field, value) {
    return Article.findOne({[field]: value})
        .populate('author', 'username bio image following').exec();
  }

  static async find(condtions, {limit, offset}) {
    return await Article.find(condtions)
        .skip(offset)
        .limit(limit)
        .sort([['updatedAt', 'descending']])
        .populate('author', 'username bio image following')
        .exec();
  }

  static async count(conditions) {
    return await Article.countDocuments(conditions).exec();
  }
}

module.exports = ArticlesRepository;
