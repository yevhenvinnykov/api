module.exports =
  process.env.ORM === 'MONGOOSE'
    ? require('./comments.mongoose')
    : require('./comments.sequelize');
