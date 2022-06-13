const UsersService = require('./users.service');
const UsersRepository = require('../../db/users/users.repository');
const jwt = require('jsonwebtoken');

describe('USERS SERVICE', () => {
  describe('CREATE USER', () => {
    test('should create a user', async () => {
      jest.spyOn(UsersRepository, 'create').mockReturnValue({user: 'user'});
      jest.spyOn(UsersRepository, 'findOneBy').mockReturnValue({user: 'user'});
      jest.spyOn(jwt, 'sign').mockReturnValue('token');
      const user = await UsersService.createUser({userData: {user: 'user'}});
      expect(user).toEqual({user: 'user', token: 'token'});
    });

    test('should throw an error if the user wasn\'t created', async () => {
      jest.spyOn(UsersRepository, 'create');
      jest.spyOn(UsersRepository, 'findOneBy').mockReturnValue(null);
      try {
        await UsersService.createUser({userData: {user: 'user'}});
      } catch (error) {
        expect(error.message)
            .toBe('Something went wrong when creating the user');
      }
    });
  });

  describe('UPDATE USER', () => {
    test('should update a logged in user', async () => {
      jest.spyOn(UsersRepository, 'findOneBy').mockReturnValue({user: 'user'});
      jest.spyOn(UsersRepository, 'update').mockReturnValue({user: 'updated user'});
      jest.spyOn(jwt, 'sign').mockReturnValue('token');
      const user = await UsersService
          .updateUser({authUserId: 1, updateData: 'update data'});
      user.user = 'updated user';
      expect(user).toEqual({user: 'updated user', token: 'token'});
    });

    test('should throw an error if the user wasn\'t found', async () => {
      jest.spyOn(UsersRepository, 'findOneBy').mockReturnValue(null);
      try {
        await UsersService.updateUser({authUserId: 1});
      } catch (error) {
        expect(error.message).toBe('User not found');
      }
    });
  });
});
