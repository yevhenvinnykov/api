const ArticlesRepository = require('../../../db/repos/articles/articles.repository');
const UsersRepository = require('../../../db/repos/users/users.repository');
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

    if (article.author.id !== authUserId) {
      throw new BadRequestError('You are not authorized to update the article');
    }

    article = await ArticlesRepository.update(article, updateData);

    return article;
  },

  async getArticle(slug, authUserId) {
    const article = await ArticlesDBService.fetchArticleFromDB(slug);
    const authUser = authUserId ?
        await UsersRepository.findOneBy('id', authUserId, ['favorites', 'following']) :
        null;

    article.author.following = !!authUser && authUser.following
        .some((id) => id.toString() === article.author.id.toString());
    article.favorited = !!authUser && authUser.favorites
        .some((id) => id.toString() === article.id.toString());

    return article;
  },

  async deleteArticle(slug, authUserId) {
    const {deletedCount} = await ArticlesRepository
        .delete({slug, authorId: authUserId});

    if (!deletedCount) {
      throw new BadRequestError('Something went wrong whhile deleting the article');
    }
  },
};

module.exports = ArticlesCRUDService;
