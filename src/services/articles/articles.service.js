const {NotFoundError, BadRequestError} = require('../../utils/errorHandler');
const UsersRepository = require('../../db/users.repository');
const ArticlesRepository = require('../../db/articles.repository');

const ArticlesService = {
  async createArticle({authUserId, articleData}) {
    const article = await ArticlesRepository.create(authUserId, articleData);
    if (!article) {
      throw new BadRequestError('Something went wrong when creating article');
    }
    return article;
  },

  async updateArticle({slug, authUserId, updateData}) {
    let article = await this.fetchArticleFromDB(slug);
    if (!article.author.equals(authUserId)) {
      throw new BadRequestError('You are not authorized to update the article');
    }
    article = await ArticlesRepository.update(article, updateData);
    return article;
  },

  async getArticle({slug, authUserId}) {
    let article = await this.fetchArticleFromDB(slug);
    const authUser = authUserId ?
            await this.fetchAuthUserFromDB(authUserId) :
            null;
    article = JSON.parse(JSON.stringify(article));
    article.author.following = !!authUser && authUser.following
        .some((id) => id.equals(article.author._id));
    article.favorited = !!authUser && authUser.favorites
        .some((id) => id.equals(article._id));
    return article;
  },

  async deleteArticle({slug, authUserId}) {
    const {deletedCount} = await ArticlesRepository
        .delete({slug, author: authUserId});
    if (!deletedCount) {
      throw new BadRequestError('Article not found or you\'re not authorized');
    }
  },

  async likeArticle(slug, authUserId) {
    const authUser = await this.fetchAuthUserFromDB(authUserId);
    const article = await this.fetchArticleFromDB(slug);
    if (!authUser.favorites.some((id) => id.equals(article._id))) {
      await this.handleArticleLike(authUser, article);
    }
    return {...article._doc, favorited: true};
  },

  async dislikeArticle(slug, authUserId) {
    const authUser = await this.fetchAuthUserFromDB(authUserId);
    const article = await this.fetchArticleFromDB(slug);
    const index = authUser.favorites.indexOf(article._id);
    if (index !== -1) {
      await this.handleArticleLike(authUser, article, index);
    }
    return {...article._doc, favorited: false};
  },

  async getArticlesFromFollowedUsers(authUserId, query) {
    // TODO: have to work on that method because it's gonna fetch
    // loads of unnecessary articles once the offset gets larger
    const authUser = await this.fetchAuthUserFromDB(authUserId);
    let articles = [];
    let articlesCount = 0;
    const start = +query?.offset || 0;
    const end = +query?.limit + start || 5;
    for (const userId of authUser.following) {
      const userArticles = await ArticlesRepository
          .find({author: userId}, {limit: 0, offset: 0});
      articles.push(...userArticles);
      articlesCount += userArticles.length;
    }
    articles = articles.slice(start, end);
    articles = this
        .addFavoritedInfoToArticles(articles, authUser.favorites);
    return {articles, articlesCount};
  },

  async getArticles(authUserId, query) {
    let [articles, articlesCount] = await this
        .fetchArticlesFromDB(query);
    if (!authUserId) return {articles, articlesCount};
    const authUser = await this.fetchAuthUserFromDB(authUserId);
    articles = this
        .addFavoritedInfoToArticles(articles, authUser.favorites);
    return {articles, articlesCount};
  },

  async getTags() {
    const [articles] = await this.fetchArticlesFromDB({limit: 30});
    const tags = new Set();
    for (const article of articles) {
      article.tagList.forEach((tag) => tags.add(tag));
    }
    return [...tags];
  },

  addFavoritedInfoToArticles(articles, authUserFavorites) {
    const articlesWithFavoriteInfo = [];
    for (const article of articles) {
      if (authUserFavorites.some((id) => id.equals(article._id))) {
        articlesWithFavoriteInfo.push({...article._doc, favorited: true});
        continue;
      }
      articlesWithFavoriteInfo.push({...article._doc, favorited: false});
    }
    return articlesWithFavoriteInfo;
  },

  async fetchAuthUserFromDB(authUserId) {
    const authUser = await UsersRepository
        .findOneBy('_id', authUserId, 'favorites following');
    if (!authUser) throw new NotFoundError('User not found');
    return authUser;
  },

  async fetchArticleFromDB(slug) {
    const article = await ArticlesRepository.findOneBy('slug', slug);
    if (!article) throw new NotFoundError('Article not found');
    return article;
  },

  async fetchArticlesFromDB(queryFromRequest) {
    const condtions = await this
        .createQueryConditions(queryFromRequest);
    const options = {
      limit: queryFromRequest?.limit || 5,
      offset: queryFromRequest?.offset || 0,
    };
    const articles = await ArticlesRepository
        .find(condtions, options);
    if (!articles) throw new NotFoundError('Articles not found');
    const articlesCount = await ArticlesRepository.count(condtions);
    return [articles, articlesCount];
  },

  async createQueryConditions(query) {
    const queryConditions = {};
    if (query?.author) {
      queryConditions.author = await UsersRepository
          .findOneBy('username', query.author, '_id');
    }
    if (query?.favorited) {
      const user = await UsersRepository
          .findOneBy('username', query.favorited, 'favorites');
      queryConditions._id = {$in: user?.favorites};
    }
    if (query?.tag) {
      queryConditions.tagList = query.tag;
    }
    return queryConditions;
  },

  async handleArticleLike(authUser, article, index) {
    if (typeof index === 'number') {
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
  },
};


module.exports = ArticlesService;
