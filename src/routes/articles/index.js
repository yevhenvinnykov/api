module.exports = (app) => {
  require('./articles-getter.router')(app);
  require('./articles-crud.router')(app);
  require('./articles-like.router')(app);
};
