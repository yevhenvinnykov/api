const ArticlesRepository = require('../../../db/articles/articles.repository');
const {BadRequestError} = require('../../../middleware/errors/errorHandler');
const ArticlesDBService = require('../db/articles-db.service');

const ArticlesCRUDService = {
  async createArticle(authUserId, articleData) {
    const article = await ArticlesRepository.create(authUserId, articleData);

    if (!article) {
      throw new BadRequestError('Something went wrong when creating article');
    }

    return article;
  },

  async updateArticle({slug, authUserId, updateData}) {
    let article = await ArticlesDBService.fetchArticleFromDB(slug);

    if (!article.author.equals(authUserId)) {
      throw new BadRequestError('You are not authorized to update the article');
    }

    article = await ArticlesRepository.update(article, updateData);

    return article;
  },

  async getArticle(slug, authUserId) {
    let article = await ArticlesDBService.fetchArticleFromDB(slug);
    const authUser = authUserId ?
                await ArticlesDBService.fetchAuthUserFromDB(authUserId) :
                null;

    article = JSON.parse(JSON.stringify(article));
    article.author.following = !!authUser && authUser.following
        .some((id) => id.equals(article.author._id));
    article.favorited = !!authUser && authUser.favorites
        .some((id) => id.equals(article._id));

    return article;
  },

  async deleteArticle(slug, authUserId) {
    const {deletedCount} = await ArticlesRepository
        .delete({slug, author: authUserId});

    if (!deletedCount) {
      throw new BadRequestError('Article not found or you\'re not authorized');
    }
  },
};

module.exports = ArticlesCRUDService;
