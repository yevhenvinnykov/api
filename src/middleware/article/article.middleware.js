const ArticlesRepository = require('../../db/repos/articles/index');
const { ErrorHandler, BadRequestError } = require('../errors/errorHandler');

const ArticleMiddleware = {
  async checkIfTitleIsUnique(req, res, next) {
    if (!req.body.article.title) return next();
    try {
      const article = await ArticlesRepository.findOneBy(
        'title',
        req.body.article.title
      );
      if (article) {
        throw new BadRequestError('Article with this title already exists');
      }
      next();
    } catch (error) {
      ErrorHandler.catchError(res, error);
    }
  },
};

module.exports = ArticleMiddleware;
