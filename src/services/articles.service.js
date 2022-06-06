const { NotFoundError, BadRequestError } = require('../utils/errorHandler');
const db = require('../models');
const Article = db.article;
const User = db.user;

class ArticlesService {

    static async createArticle({ authUserId, articleData }) {
        const article = await new Article({
            title: articleData.title,
            description: articleData.description,
            body: articleData.body,
            tagList: articleData.tagList,
            slug: articleData.title,
            author: authUserId
        }).save();
        return article;
    }

    static async updateArticle({ slug, authUserId, updateData }) {
        const article = await ArticlesService.#fetchArticleFromDB(slug);
        if (!article.author.equals(authUserId)) {
            throw new BadRequestError('You are not authorized to update the article');
        }
        for (const prop in updateData) {
            article[prop] = updateData[prop];
            article.slug = article.title;
        }
        await article.save();
        return article;
    }

    static async getArticle({ slug, authUserId }) {
        const article = await ArticlesService.#fetchArticleFromDB(slug);
        const authUser = authUserId
            ? await ArticlesService.#fetchAuthUserFromDB(authUserId)
            : null;
        article._doc.author._doc.following = !!authUser && authUser.following
            .some(id => id.equals(article.author._id));
        article._doc.favorited = !!authUser && authUser.favorites
            .some(id => id.equals(article._id));
        return article._doc;
    }

    static async deleteArticle({ slug, authUserId }) {
        const { deletedCount } = await Article.deleteOne({ slug, author: authUserId });
        if (!deletedCount) throw new BadRequestError('Article not found or you\'re not authorized');
    }

    static async likeArticle(slug, authUserId) {
        const authUser = await ArticlesService.#fetchAuthUserFromDB(authUserId);
        const article = await ArticlesService.#fetchArticleFromDB(slug);
        if (!authUser.favorites.some(id => id.equals(article._id))) {
            article.favoritesCount++;
            await article.save();
            authUser.favorites.push(article._id);
            await authUser.save();
        }
        return { ...article._doc, favorited: true };
    }

    static async dislikeArticle(slug, authUserId) {
        const authUser = await ArticlesService.#fetchAuthUserFromDB(authUserId);
        const article = await ArticlesService.#fetchArticleFromDB(slug);
        const index = authUser.favorites.indexOf(article._id);
        if (index !== -1) {
            article.favoritesCount--;
            await article.save();
            authUser.favorites.splice(index, 1);
            await authUser.save();
        }
        return { ...article._doc, favorited: false };
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
            const userArticles = await Article.find({ author: userId })
                .sort([['updatedAt', 'descending']])
                .populate('author', 'username bio image following')
                .exec();
            articles.push(...userArticles);
            articlesCount += userArticles.length;
            if (articles.length > end) break;
        }
        articles = articles.slice(start, end);
        articles = ArticlesService.#addFavoritedInfoToArticles(articles, authUser.favorites);
        return { articles, articlesCount };
    }

    static async getArticles(authUserId, query) {
        let [articles, articlesCount] = await ArticlesService.#fetchArticlesFromDB(query);
        if (!authUserId) return { articles, articlesCount };
        const authUser = await ArticlesService.#fetchAuthUserFromDB(authUserId);
        articles = ArticlesService.#addFavoritedInfoToArticles(articles, authUser.favorites);
        return { articles, articlesCount };
    }

    static async getTags() {
        let [articles] = await ArticlesService.#fetchArticlesFromDB({ limit: 30 });
        const tags = new Set();
        for (const article of articles) {
            article.tagList.forEach(tag => tags.add(tag));
        }
        return [...tags];
    }

    static #addFavoritedInfoToArticles(articles, authUserFavorites) {
        const articlesWithFavoriteInfo = [];
        for (const article of articles) {
            if (authUserFavorites.some(id => id.equals(article._id))) {
                articlesWithFavoriteInfo.push({ ...article._doc, favorited: true });
                continue;
            }
            articlesWithFavoriteInfo.push({ ...article._doc, favorited: false });
        }
        return articlesWithFavoriteInfo;
    }

    static async #fetchAuthUserFromDB(authUserId) {
        const authUser = await User.findOne({ _id: authUserId }).exec();
        if (!authUser) throw new NotFoundError('User not found');
        return authUser;
    }

    static async #fetchArticleFromDB(slug) {
        const article = await Article.findOne({ slug })
            .populate('author', 'username bio image following').exec();
        if (!article) throw new NotFoundError('Article not found');
        return article;
    }

    static async #fetchArticlesFromDB(queryFromRequest) {
        const queryParams = await ArticlesService.#createQueryParams(queryFromRequest);
        let articles = await Article.find(queryParams)
            .skip(queryFromRequest?.offset || 0)
            .limit(queryFromRequest?.limit || 5)
            .sort([['updatedAt', 'descending']])
            .populate('author', 'username bio image following')
            .exec();
        const articlesCount = await Article.countDocuments(queryParams).exec();
        if (!articlesCount) throw new NotFoundError('Article not found')
        return [articles, articlesCount];
    }

    static async #createQueryParams(query) {
        const queryParams = {};
        if (query?.author) {
            queryParams.author = typeof query.author === 'string'
                ? (await User.findOne({ username: query.author }))._id
                : query.author.id;
        }
        if (query?.favorited) {
            const user = await User.findOne({ username: query.favorited });
            queryParams._id = { $in: user?.favorites };
        }
        if (query?.tag) {
            queryParams.tagList = query.tag;
        }
        return queryParams;

    }
}


module.exports = ArticlesService;