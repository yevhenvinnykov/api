const updateUserHelper = require('../../src/utils/updateUserHelper');

describe('UpdateUserHelper', () => {
    test('should update the user\'s name', () => {
        const userMock = { username: 'John' };
        updateUserHelper(userMock, { username: 'Jane' });
        expect(userMock.username).toBe('Jane');
    });
});

describe('UpdateUserHelper', () => {
    test('should update the user\'s password', () => {
        const userMock = { username: 'John' };
        updateUserHelper(userMock, { password: 'password' });
        expect(userMock.password).toBeTruthy();
    });
});
