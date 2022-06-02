const addFavoriteInfoToArticles = require('../../utils/addFavoriteInfoToArticles');

describe('AddFavoriteInfoToArticles', () => {
    let articlesMock;
    beforeEach(() => {
        articlesMock = [
            {
                _doc: {},
                author: { _doc: { _id: 123 } },
            }
        ];
    });

    test('add following: true to an article', () => {
        const authUserMock = {
            favorites: [{ equals: () => true }]
        };
        const articlesWithFavoriteInfo = addFavoriteInfoToArticles(articlesMock, authUserMock);
        expect(articlesWithFavoriteInfo[0].favorited).toBe(true);
    });

    test('add following: false to an article', () => {
        const authUserMock = {
            favorites: [{ equals: () => false }]
        };
        const articlesWithFavoriteInfo = addFavoriteInfoToArticles(articlesMock, authUserMock);
        expect(articlesWithFavoriteInfo[0].favorited).toBe(false);
    });

});




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