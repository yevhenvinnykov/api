const UsersService = require('./users.service');
const UsersDB = require('../../db/users.db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

describe('USERS SERVICE', () => {
  describe('CREATE USER', () => {
    test('should create a user', async () => {
      jest.spyOn(UsersDB, 'create').mockReturnValue({user: 'user'});
      jest.spyOn(UsersDB, 'findOneBy').mockReturnValue({user: 'user'});
      jest.spyOn(jwt, 'sign').mockReturnValue('token');
      const user = await UsersService.createUser({userData: {user: 'user'}});
      expect(user).toEqual({user: 'user', token: 'token'});
    });

    test('should throw an error if the user wasn\'t created', async () => {
      jest.spyOn(UsersDB, 'create');
      jest.spyOn(UsersDB, 'findOneBy').mockReturnValue(null);
      try {
        await UsersService.createUser({userData: {user: 'user'}});
      } catch (error) {
        expect(error.message)
            .toBe('Something went wrong when creating the user');
      }
    });
  });

  describe('GET LOGGED IN USER', () => {
    test('should return a logged in user', async () => {
      jest.spyOn(UsersDB, 'findOneBy').mockReturnValue({user: 'user'});
      const user = await UsersService.getLoggedInUser({authUserId: 1});
      expect(user).toEqual({user: 'user'});
    });

    test('should throw an error if the user wasn\'t found', async () => {
      jest.spyOn(UsersDB, 'findOneBy').mockReturnValue(null);
      try {
        await UsersService.getLoggedInUser({authUserId: 1});
      } catch (error) {
        expect(error.message).toBe('User not found');
      }
    });
  });

  describe('UPDATE USER', () => {
    test('should update a logged in user', async () => {
      jest.spyOn(UsersDB, 'findOneBy').mockReturnValue({user: 'user'});
      jest.spyOn(UsersDB, 'update').mockReturnValue({user: 'updated user'});
      jest.spyOn(jwt, 'sign').mockReturnValue('token');
      const user = await UsersService
          .updateUser({authUserId: 1, updateData: 'update data'});
      user.user = 'updated user';
      expect(user).toEqual({user: 'updated user', token: 'token'});
    });

    test('should throw an error if the user wasn\'t found', async () => {
      jest.spyOn(UsersDB, 'findOneBy').mockReturnValue(null);
      try {
        await UsersService.updateUser({authUserId: 1});
      } catch (error) {
        expect(error.message).toBe('User not found');
      }
    });
  });

  describe('LOG IN', () => {
    test('should log a user in if the credentials are correct', async () => {
      jest.spyOn(UsersDB, 'findOneBy').mockReturnValue({user: 'user'});
      jest.spyOn(jwt, 'sign').mockReturnValue('token');
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);
      const user = await UsersService.logIn('test@email.com', 'password');
      expect(user).toEqual({user: 'user', token: 'token'});
    });

    test('should throw an error if the user wasn\'t found', async () => {
      jest.spyOn(UsersDB, 'findOneBy').mockReturnValue(null);
      try {
        await UsersService.logIn('test@email.com', 'password');
      } catch (error) {
        expect(error.message).toBe('User not found');
      }
    });

    test('should throw an error if the credentials aren\'t correct',
        async () => {
          jest.spyOn(UsersDB, 'findOneBy').mockReturnValue({user: 'user'});
          jest.spyOn(bcrypt, 'compareSync').mockReturnValue(false);
          try {
            await UsersService.logIn('test@email.com', 'password');
          } catch (error) {
            expect(error.message).toBe('Email or password is not valid');
          }
        });
  });
});
