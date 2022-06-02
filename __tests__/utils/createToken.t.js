const createToken = require('../../utils/createToken');

describe('CreateToken', () => {
    test('should create a token', () => {
        expect(createToken(123)).toBeTruthy();
    });
});
