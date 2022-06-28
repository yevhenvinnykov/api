module.exports = {
  dbName: process.env.NODE_ENV === 'DEV' ? 'sqlite_db' : 'test_bd',
  username: 'user',
  password: 'password',
  options: {
    dialect: 'sqlite',
    storage: process.env.NODE_ENV === 'DEV' ? './dev.sqlite' : './test.sqlite',
    logging: false,
  },
};
