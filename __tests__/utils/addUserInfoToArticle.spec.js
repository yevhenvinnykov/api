const addUserInfoToArticle = require('../../src/utils/addUserInfoToArticle');

describe('AddUserInfoToArticle', () => {

    const authUserMock = {
        following: [{ equals: () => false }],
        favorites: [{ equals: () => true }]
    };
    const articleMock = {
        _doc: {},
        author: { _doc: { _id: 123 } },
        favorited: {}
    };
    test('add info about being followed and favorited to the article', () => {
        const article = addUserInfoToArticle(authUserMock, articleMock);
        expect(article).toBeTruthy();
        expect(article.favorited).toBe(true);
        expect(article.author.following).toBe(false);
    });
});