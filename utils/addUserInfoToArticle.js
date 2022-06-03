module.exports = (authUser, article) => {
    const articleCopy = { ...article._doc, author: { ...article.author._doc }, favorited: article._doc.favorited };
    articleCopy.author.following = !!authUser.following.find(id => id.equals(articleCopy.author._id));
    articleCopy.favorited = !!authUser.favorites.find(id => id.equals(articleCopy._id));
    return articleCopy;
};