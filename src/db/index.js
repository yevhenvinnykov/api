const config = require('./config');

const db = {
  initializeWithMongo() {
    this.mongoose = require('mongoose');
    this.user = require('./models/mongoose/user.model');
    this.article = require('./models/mongoose/article.model');
    this.comment = require('./models/mongoose/comment.model');
  },
  initializeWithSequelize() {
    const {Sequelize} = require('sequelize');
    this.sequelize = new Sequelize(config.dbName, config.username, config.password, config.options);
  },
};

if (process.env.ORM === 'MONGOOSE') {
  db.initializeWithMongo();
}
if (process.env.ORM === 'SEQUELIZE') {
  db.initializeWithSequelize();
}

module.exports = db;
