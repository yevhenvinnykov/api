const ArticlesDB = require('../../db/articles.db');
const {ErrorHandler, BadRequestError} = require('../../utils/errorHandler');

checkIfArticleTitleIsUnique = async (req, res, next) => {
  try {
    const article = await ArticlesDB.findOneBy('title', req.body.article.title);
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
