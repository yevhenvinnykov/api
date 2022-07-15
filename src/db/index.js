const db = {
  isMongo: process.env.ORM === 'MONGOOSE',

  init() {
    if (this.isMongo) {
      this.mongoose = require('mongoose');
    }

    if (!this.isMongo) {
      const { Sequelize } = require('sequelize');
      const sequelizeConfig = require('./sequelize-config');
      this.sequelize = new Sequelize(
        sequelizeConfig.dbName,
        sequelizeConfig.username,
        sequelizeConfig.password,
        sequelizeConfig.options
      );
    }
  },

  async connect() {
    if (this.isMongo) {
      const dbName =
        process.env.NODE_ENV === 'DEV' ? process.env.DB_NAME : 'test_DB';
      const url = `mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${dbName}`;
      try {
        await this.mongoose.connect(url);
        console.log(
          `Successfully connected to mongodb on port ${process.env.MONGO_PORT}`
        );
      } catch (error) {
        console.log(error);
      }
    }

    if (!this.isMongo) {
      try {
        await this.sequelize.sync();
        console.log('Successfully connected to SQLite DB');
      } catch (error) {
        console.log(error);
      }
    }
  },

  async close() {
    if (this.isMongo) {
      await this.mongoose.connection.close();
    }
    if (!this.isMongo) {
      this.sequelize.close();
    }
  },
};

db.init();

module.exports = {
  connect: db.connect.bind(db),
  close: db.close.bind(db),
  sequelize: db.sequelize,
  mongoose: db.mongoose,
};
