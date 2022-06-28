module.exports = process.env.ORM === 'MONGOOSE'
? require('./articles.mongoose')
: require('./articles.sequelize');
