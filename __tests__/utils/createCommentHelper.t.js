const createCommentHelper = require('../../utils/createCommentHelper');

describe('CreateCommentHelper', () => {
    test('create a comment', () => {
        const comment =  createCommentHelper('test', 123, 321);
        expect(comment).toBeTruthy();
        expect(comment.body).toBe('test');
        expect(comment.createdAt).toBeInstanceOf(Date);
    });
});