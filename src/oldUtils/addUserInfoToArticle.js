module.exports = (authUser, article) => {
    const articleCopy = { ...article._doc, author: { ...article.author._doc }, favorited: article._doc.favorited };
    articleCopy.author.following = authUser ? !!authUser.following.find(id => id.equals(articleCopy.author._id)) : false;
    articleCopy.favorited = authUser ? !!authUser.favorites.find(id => id.equals(articleCopy._id)) : false;
    return articleCopy;
};