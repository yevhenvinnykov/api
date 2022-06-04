module.exports = (followedArticles, authUser) => {
    const articlesWithFavoriteInfo = [];
    for (const article of followedArticles) {
        if (authUser.favorites.find(id => id.equals(article._id))) {
            articlesWithFavoriteInfo.push({ ...article._doc, favorited: true });
            continue;
        }
        articlesWithFavoriteInfo.push({ ...article._doc, favorited: false });
    }
    return articlesWithFavoriteInfo;
};