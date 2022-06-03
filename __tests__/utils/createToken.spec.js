const createToken = require('../../src/utils/createToken');

describe('CreateToken', () => {
    test('should create a token', () => {
        expect(createToken(123)).toBeTruthy();
    });
});
