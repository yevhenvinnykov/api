const { Model, DataTypes } = require('sequelize');
const db = require('../../index');
const sequelize = db.sequelize;
const User = require('./user.model');

class Comment extends Model {}

Comment.init(
  {
    id: {
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER,
    },
    body: {
      type: DataTypes.STRING,
    },
    authorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    articleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Comments',
    freezeTableName: true,
  }
);

Comment.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

module.exports = Comment;
