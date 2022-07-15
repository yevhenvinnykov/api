const ArticlesRepository = require('../../../db/repos/articles/index');
const UsersRepository = require('../../../db/repos/users/index');
const {
  BadRequestError,
  NotFoundError,
} = require('../../../middleware/errors/errorHandler');

const ArticlesCRUDService = {
  async createArticle(authUserId, articleData) {
    const article = await ArticlesRepository.create(authUserId, articleData);
    if (!article) {
      throw new BadRequestError('Something went wrong when creating article');
    }

    return article;
  },

  async updateArticle({ slug, authUserId, updateData }) {
    let article = await ArticlesRepository.findOneBy('slug', slug);
    if (!article) throw new NotFoundError('Article not found');

    if (article.author.id !== authUserId) {
      throw new BadRequestError('You are not authorized to update the article');
    }

    article = await ArticlesRepository.update(article.id, updateData);

    return article;
  },

  async getArticle(slug, authUserId) {
    const article = await ArticlesRepository.findOneBy('slug', slug);
    if (!article) throw new NotFoundError('Article not found');

    const attributes = ['favorites', 'following'];
    const authUser = authUserId
      ? await UsersRepository.findOneBy('id', authUserId, attributes)
      : null;

    article.favorited = !!authUser && authUser.favorites.includes(article.id);
    article.author.following =
      !!authUser && authUser.following.includes(article.author.id);

    return article;
  },

  async deleteArticle(slug, authUserId) {
    const { deletedCount } = await ArticlesRepository.delete({
      slug,
      authorId: authUserId,
    });

    if (!deletedCount) {
      throw new BadRequestError(
        'Something went wrong whhile deleting the article'
      );
    }
  },
};

module.exports = ArticlesCRUDService;
