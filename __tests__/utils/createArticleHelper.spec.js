const createArticleHelper = require('../../src/utils/createArticleHelper');

describe('CreateArticleHelper', () => {
    test('create an article', () => {
        const articleDataMock = {
            title: 'title',
            description: 'description',
            body: 'body',
            tagList: ['tag'],
            slug: 'title',
        };
        const article =  createArticleHelper(articleDataMock, 123);
        expect(article).toBeTruthy();
        expect(article.body).toBe('body');
        expect(article.createdAt).toBeInstanceOf(Date);
        expect(article.tagList).toEqual(['tag']);
        expect(article.favoritesCount).toBe(0);
    });
});
