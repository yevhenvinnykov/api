const {NotFoundError, BadRequestError} = require('../utils/errorHandler');
const UsersDB = require('../db/users.db');
const ArticlesDB = require('../db/articles.db');

class ArticlesService {
  static async createArticle({authUserId, articleData}) {
    const article = await ArticlesDB.create(authUserId, articleData);
    if (!article) {
      throw new BadRequestError('Something went wrong when creating article');
    }
    return article;
  }

  static async updateArticle({slug, authUserId, updateData}) {
    let article = await ArticlesService.#fetchArticleFromDB(slug);
    if (!article) throw new NotFoundError('Article not found');
    if (!article.author.equals(authUserId)) {
      throw new BadRequestError('You are not authorized to update the article');
    }
    article = await ArticlesDB.update(article, updateData);
    return article;
  }

  static async getArticle({slug, authUserId}) {
    const article = await ArticlesService.#fetchArticleFromDB(slug);
    const authUser = authUserId ?
            await ArticlesService.#fetchAuthUserFromDB(authUserId) :
            null;
    article._doc.author._doc.following = !!authUser && authUser.following
        .some((id) => id.equals(article.author._id));
    article._doc.favorited = !!authUser && authUser.favorites
        .some((id) => id.equals(article._id));
    return article._doc;
  }

  static async deleteArticle({slug, authUserId}) {
    const {deletedCount} = await ArticlesDB.delete({slug, author: authUserId});
    if (!deletedCount) {
      throw new BadRequestError('Article not found or you\'re not authorized');
    }
  }

  static async likeArticle(slug, authUserId) {
    const authUser = await ArticlesService.#fetchAuthUserFromDB(authUserId);
    const article = await ArticlesService.#fetchArticleFromDB(slug);
    if (!authUser.favorites.some((id) => id.equals(article._id))) {
      await ArticlesService.#handleArticleLike(authUser, article);
    }
    return {...article._doc, favorited: true};
  }

  static async dislikeArticle(slug, authUserId) {
    const authUser = await ArticlesService.#fetchAuthUserFromDB(authUserId);
    const article = await ArticlesService.#fetchArticleFromDB(slug);
    const index = authUser.favorites.indexOf(article._id);
    if (index !== -1) {
      await ArticlesService.#handleArticleLike(authUser, article, index);
    }
    return {...article._doc, favorited: false};
  }

  static async getArticlesFromFollowedUsers(authUserId, query) {
    // TODO: have to work on that method because it's gonna fetch
    // loads of unnecessary articles once the offset gets larger
    const authUser = await ArticlesService.#fetchAuthUserFromDB(authUserId);
    let articles = [];
    let articlesCount = 0;
    const start = +query.offset || 0;
    const end = +query.limit + start || 5;
    for (const userId of authUser.following) {
      const userArticles = await ArticlesDB
          .find({author: userId}, {limit: 0, offset: 0});
      articles.push(...userArticles);
      articlesCount += userArticles.length;
      if (articles.length > end) break;
    }
    articles = articles.slice(start, end);
    articles = ArticlesService
        .#addFavoritedInfoToArticles(articles, authUser.favorites);
    return {articles, articlesCount};
  }

  static async getArticles(authUserId, query) {
    let [articles, articlesCount] = await ArticlesService
        .#fetchArticlesFromDB(query);
    if (!authUserId) return {articles, articlesCount};
    const authUser = await ArticlesService.#fetchAuthUserFromDB(authUserId);
    articles = ArticlesService
        .#addFavoritedInfoToArticles(articles, authUser.favorites);
    return {articles, articlesCount};
  }

  static async getTags() {
    const [articles] = await ArticlesService.#fetchArticlesFromDB({limit: 30});
    const tags = new Set();
    for (const article of articles) {
      article.tagList.forEach((tag) => tags.add(tag));
    }
    return [...tags];
  }

  static #addFavoritedInfoToArticles(articles, authUserFavorites) {
    const articlesWithFavoriteInfo = [];
    for (const article of articles) {
      if (authUserFavorites.some((id) => id.equals(article._id))) {
        articlesWithFavoriteInfo.push({...article._doc, favorited: true});
        continue;
      }
      articlesWithFavoriteInfo.push({...article._doc, favorited: false});
    }
    return articlesWithFavoriteInfo;
  }

  static async #fetchAuthUserFromDB(authUserId) {
    const authUser = await UsersDB
        .findOneBy('_id', authUserId, 'favorites following');
    if (!authUser) throw new NotFoundError('User not found');
    return authUser;
  }

  static async #fetchArticleFromDB(slug) {
    const article = await ArticlesDB.findOneBy('slug', slug);
    if (!article) throw new NotFoundError('Article not found');
    return article;
  }

  static async #fetchArticlesFromDB(queryFromRequest) {
    const condtions = await ArticlesService
        .#createQueryConditions(queryFromRequest);
    const options = {
      limit: queryFromRequest?.limit || 5,
      offset: queryFromRequest?.offset || 0,
    };
    const articles = await ArticlesDB
        .find(condtions, options);
    const articlesCount = await ArticlesDB.count(condtions);
    if (!articlesCount) throw new NotFoundError('Article not found');
    return [articles, articlesCount];
  }

  static async #createQueryConditions(query) {
    const queryConditions = {};
    if (query?.author) {
      queryConditions.author = await UsersDB
          .findOneBy('username', query.author, '_id');
    }
    if (query?.favorited) {
      const user = await UsersDB
          .findOneBy('username', query.favorited, 'favorites');
      queryConditions._id = {$in: user?.favorites};
    }
    if (query?.tag) {
      queryConditions.tagList = query.tag;
    }
    return queryConditions;
  }

  static async #handleArticleLike(authUser, article, index) {
    if (index) {
      article.favoritesCount--;
      await article.save();
      authUser.favorites.splice(index, 1);
      await authUser.save();
      return;
    }
    article.favoritesCount++;
    await article.save();
    authUser.favorites.push(article._id);
    await authUser.save();
  }
}


module.exports = ArticlesService;
