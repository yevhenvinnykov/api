const createUser = require('../../utils/createUser');

describe('CreateUser', () => {
    test('should create a user', () => {
        const dataMock = { username: 'John', email: 'johndoe@gmail.com', password: 'password'};
        const user = createUser(dataMock);
        expect(user.username).toBe('John');
        expect(user._id).toBeTruthy();
        expect(user.favorites).toEqual([]);
    });
});





