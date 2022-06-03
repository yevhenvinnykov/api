const updateArticleHelper = require('../../src/utils/updateArticleHelper');

describe('UpdateArticleHelper', () => {
    test('should update the article\'s title', () => {
        const articleMock = { title: 'Lorem' };
        updateArticleHelper(articleMock, { title: 'Ipsum' });
        expect(articleMock.title).toBe('Ipsum');
        expect(articleMock.slug).toBe('Ipsum');
    });
    
    test('should update the article\'s author', () => {
        const articleMock = { title: 'Lorem' };
        updateArticleHelper(articleMock, { author: 'John' });
        expect(articleMock.author).toBe('John');
    });
});
