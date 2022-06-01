module.exports = (article, articleData) => {
    for (const prop in articleData) {
        if (prop === 'title') {
            article.slug = articleData[prop];
        }
        article[prop] = articleData[prop];
    }
    article.updatedAt = new Date();
    return article;
};