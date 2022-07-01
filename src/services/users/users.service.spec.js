require('dotenv').config();
const UsersService = require('./users.service');
const UsersRepository = require('../../db/repos/users/index');
const jwt = require('jsonwebtoken');

describe('USERS SERVICE', () => {
  describe('CREATE USER', () => {
    const signUpDataMock = {
      username: 'user',
      email: 'user@example.com',
      password: 'P4ssword',
    };

    const userMock = {
      id: 1,
      email: 'user@example.com',
      username: 'user',
      bio: 'bio',
      image: 'image',
      token: 'token',
    };

    test('should create a user', async () => {
      jest.spyOn(UsersRepository, 'create').mockReturnValue(userMock);
      jest.spyOn(jwt, 'sign').mockReturnValue('token');

      const user = await UsersService.createUser({userData: {signUpDataMock}});

      expect(user).toEqual(userMock);
    });

    test('should throw an error if the user wasn\'t created', async () => {
      jest.spyOn(UsersRepository, 'create').mockReturnValue(null);
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
      jest.spyOn(UsersRepository, 'update').mockReturnValue({user: 'updated user'});
      jest.spyOn(jwt, 'sign').mockReturnValue('token');

      const user = await UsersService.updateUser({authUserId: 1, updateData: 'update data'});

      expect(user).toEqual({user: 'updated user', token: 'token'});
    });

    test('should throw an error if the user wasn\'t found', async () => {
      jest.spyOn(UsersRepository, 'update').mockReturnValue(null);
      try {
        await UsersService.updateUser({authUserId: 1});
      } catch (error) {
        expect(error.message).toBe('User not found');
      }
    });
  });
});
