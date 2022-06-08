const ArticlesService = require('../services/articles/articles.service');
const {ErrorHandler} = require('../utils/errorHandler');


class ArticlesController {
  static async handleArticleCRUD(req, res) {
    try {
      const data = ArticlesController.#extractDataFromReq(req);
      let action;
      switch (req.method) {
        case 'POST': action = 'createArticle';
          break;
        case 'GET': action = 'getArticle';
          break;
        case 'PUT': action = 'updateArticle';
          break;
        case 'DELETE': action = 'deleteArticle';
      }
      const article = await ArticlesService[action](data);
      res.status(200).json({article});
    } catch (error) {
      ErrorHandler.catchError(res, error);
    }
  }

  static async handleArticleLikeDislike(req, res) {
    try {
      const {slug, authUserId} = ArticlesController.#extractDataFromReq(req);
      const action = req.method === 'POST' ? 'likeArticle' : 'dislikeArticle';
      const article = await ArticlesService[action](slug, authUserId);
      res.status(200).json({article});
    } catch (error) {
      ErrorHandler.catchError(res, error);
    }
  }

  static async getArticles(req, res) {
    try {
      const action = req.route.path === '/api/articles' ?
       'getArticles' :
       'getArticlesFromFollowedUsers';
      const {articles, articlesCount} =
      await ArticlesService[action](req.userId, req.query);
      res.status(200).json({articles, articlesCount});
    } catch (error) {
      ErrorHandler.catchError(res, error);
    }
  }

  static async getTags(req, res) {
    try {
      const tags = await ArticlesService.getTags();
      res.status(200).json({tags});
    } catch (error) {
      ErrorHandler.catchError(res, error);
    }
  }

  static #extractDataFromReq(req) {
    const data = {};
    data.slug = req.params?.slug;
    data.authUserId = req?.userId;
    data.updateData = req.body?.article;
    data.articleData = req.body?.article;
    return data;
  }
}

module.exports = ArticlesController;
