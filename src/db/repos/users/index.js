const UsersRepository =
  process.env.ORM === 'MONGOOSE'
    ? require('./users.mongoose')
    : require('./users.sequelize');

module.exports = UsersRepository;
