const {Model, DataTypes} = require('sequelize');
const db = require('../../index');
const sequelize = db.sequelize;


class User extends Model { }

const defaultUserImage = 'https://st3.depositphotos.com/2229436/13671/v/600/depositphotos_136717406-stock-illustration-flat-user-icon-member-sign.jpg';

User.init({
  id: {
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.INTEGER,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: {msg: 'Username is required'},
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: {msg: 'Email is required'},
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: {msg: 'Password is required'},
    },
  },
  bio: {
    type: DataTypes.STRING,
    defaultValue: 'bio',
  },
  image: {
    type: DataTypes.STRING,
    defaultValue: defaultUserImage,
  },
  favorites: {
    type: DataTypes.JSON,
    defaultValue: JSON.stringify([]),
  },
  following: {
    type: DataTypes.JSON,
    defaultValue: JSON.stringify([]),
  },
}, {
  // hooks: {
  //   beforeFind: function(options) {
  //     options.attributes.exclude = ['createdAt', 'updatedAt', 'password'];
  //     return options;
  //   },
  // },
  sequelize,
  modelName: 'Users',
  freezeTableName: true,
});


module.exports = User;
