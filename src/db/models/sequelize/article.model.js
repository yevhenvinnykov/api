
const {Model, DataTypes} = require('sequelize');
const db = require('../../index');
const sequelize = db.sequelize;

class Article extends Model { }

console.log(sequelize);

Article.init({
  slug: {
    type: DataTypes.STRING,
  },
  title: {
    type: DataTypes.STRING,
  },
  description: {
    type: DataTypes.STRING,
  },
  body: {
    type: DataTypes.STRING,
  },
  tagList: {
    type: DataTypes.STRING,
  },
  favorited: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  favoritesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  author: {
    type: DataTypes.STRING,
  },
}, {
  sequelize,
  modelName: 'Article',
});


module.exports = Article;
