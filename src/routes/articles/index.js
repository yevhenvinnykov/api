module.exports = (app) => {
  require('./getter/articles-getter.router')(app);
  require('./crud/articles-crud.router')(app);
  require('./like/articles-like.router')(app);
};
