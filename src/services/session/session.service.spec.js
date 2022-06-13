const SessionService = require('./session.service');
const UsersRepository = require('../../db/users/users.repository');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

describe('SESSION SERVICE', () => {
  describe('GET LOGGED IN USER', () => {
    test('should return a logged in user', async () => {
      jest.spyOn(UsersRepository, 'findOneBy').mockReturnValue({user: 'user'});
      const user = await SessionService.getLoggedInUser({authUserId: 1});
      expect(user).toEqual({user: 'user'});
    });

    test('should throw an error if the user wasn\'t found', async () => {
      jest.spyOn(UsersRepository, 'findOneBy').mockReturnValue(null);
      try {
        await SessionService.getLoggedInUser({authUserId: 1});
      } catch (error) {
        expect(error.message).toBe('User not found');
      }
    });
  });

  describe('LOG IN', () => {
    test('should log a user in if the credentials are correct', async () => {
      jest.spyOn(UsersRepository, 'findOneBy').mockReturnValue({user: 'user'});
      jest.spyOn(jwt, 'sign').mockReturnValue('token');
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);
      const user = await SessionService.logIn('test@email.com', 'password');
      expect(user).toEqual({user: 'user', token: 'token'});
    });

    test('should throw an error if the user wasn\'t found', async () => {
      jest.spyOn(UsersRepository, 'findOneBy').mockReturnValue(null);
      try {
        await SessionService.logIn('test@email.com', 'password');
      } catch (error) {
        expect(error.message).toBe('User not found');
      }
    });

    test('should throw an error if the credentials aren\'t correct',
        async () => {
          jest.spyOn(UsersRepository, 'findOneBy').mockReturnValue({user: 'user'});
          jest.spyOn(bcrypt, 'compareSync').mockReturnValue(false);
          try {
            await SessionService.logIn('test@email.com', 'password');
          } catch (error) {
            expect(error.message).toBe('Email or password is not valid');
          }
        });
  });
});
