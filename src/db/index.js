

const db = {};

if (process.env.ORM === 'MONGOOSE') {
  const mongoose = require('mongoose');
  db.mongoose = mongoose;
  db.user = require('./models/mongoose/user.model');
  db.article = require('./models/mongoose/article.model');
  db.comment = require('./models/mongoose/comment.model');
}

if (process.env.ORM === 'SEQUELIZE') {
  const {Sequelize} = require('sequelize');
  db.sequelize = new Sequelize('sqlite_db', 'user', 'password', {
    dialect: 'sqlite',
    storage: './dev.sqlite',
    logging: false,
  });
}


module.exports = db;
