const ArticlesRepository = require('../../db/articles.repository');
const {ErrorHandler, BadRequestError} = require('../errors/errorHandler');

checkIfArticleTitleIsUnique = async (req, res, next) => {
  try {
    const article = await ArticlesRepository
        .findOneBy('title', req.body.article.title);
    if (article) {
      throw new BadRequestError('Article with this title already exists');
    }
    next();
  } catch (error) {
    ErrorHandler.catchError(res, error);
  }
};

module.exports = {
  checkIfArticleTitleIsUnique,
};
