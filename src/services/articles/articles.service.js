const ArticlesCRUDService = require('./crud/articles-crud.service');
const ArticlesLikeService = require('./like/articles-like.service');
const ArticlesGetterService = require('./getter/articles-getter.service');

const ArticlesService = {
  async create(authUserId, articleData) {
    return await ArticlesCRUDService.createArticle(authUserId, articleData);
  },

  async update({slug, authUserId, updateData}) {
    return await ArticlesCRUDService.updateArticle({slug, authUserId, updateData});
  },

  async getOne(slug, authUserId) {
    return await ArticlesCRUDService.getArticle(slug, authUserId);
  },

  async delete(slug, authUserId) {
    return await ArticlesCRUDService.deleteArticle(slug, authUserId);
  },

  async getMany(authUserId, query) {
    return await ArticlesGetterService.getArticles(authUserId, query);
  },

  async getFromFollowed(authUserId, query) {
    return await ArticlesGetterService.getArticlesFromFollowedUsers(authUserId, query);
  },

  async getTags(authUserId, query) {
    return await ArticlesGetterService.getTags(authUserId, query);
  },

  async like(slug, authUserId) {
    return await ArticlesLikeService.likeArticle(slug, authUserId);
  },

  async dislike(slug, authUserId) {
    return await ArticlesLikeService.dislikeArticle(slug, authUserId);
  },
};

module.exports = ArticlesService;
