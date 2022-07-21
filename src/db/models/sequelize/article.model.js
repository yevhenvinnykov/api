const { Model, DataTypes } = require('sequelize');
const db = require('../../index');
const sequelize = db.sequelize;
const User = require('./user.model');

class Article extends Model {}

Article.init(
  {
    id: {
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER,
    },
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
    image: {
      type: DataTypes.STRING,
    },
    tagList: {
      type: DataTypes.JSON,
    },
    favorited: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    favoritesCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    authorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: 'Articles',
    freezeTableName: true,
  }
);

Article.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

module.exports = Article;
