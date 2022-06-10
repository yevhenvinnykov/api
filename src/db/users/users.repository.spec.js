const db = require('../models');
const User = db.user;
const bcrypt = require('bcryptjs');
const UsersRepository = require('./users.repository');
const mockingoose = require('mockingoose');

describe('USERS REPOSITORY', () => {
  let mockUser;

  beforeEach(() => {
    mockUser = {
      username: 'username',
      email: 'email@email.com',
      password: 'password',
      save: () => {},
    };
  });

  describe('CREATE', () => {
    test('should create a new user', async () => {
      mockingoose(User).toReturn(mockUser);
      jest.spyOn(bcrypt, 'hashSync').mockReturnValue('password');

      const user = await UsersRepository.create(mockUser);

      expect(user.username).toBe('username');
      expect(user.email).toBe('email@email.com');
      expect(user.password).toBe('password');
    });
  });

  describe('UPDATE', () => {
    test('should update the new user', async () => {
      const mockUpdateData = {
        username: 'updated name',
        password: 'updated password',
        propToBeIgnored: 'ignore me',
      };
      mockingoose(User).toReturn(mockUpdateData, 'save');
      jest.spyOn(bcrypt, 'hashSync').mockReturnValue('updated password');

      const updatedUser = await UsersRepository.update(mockUser, mockUpdateData);

      expect(updatedUser.username).toBe('updated name');
      expect(updatedUser.password).toBe('updated password');
      expect(updatedUser.propToBeIgnored).toBeUndefined();
    });
  });

  describe('FIND ONE BY', () => {
    test('should find a user with the given field having the given value', async () => {
      mockingoose(User).toReturn(mockUser, 'findOne');

      const user = await UsersRepository.findOneBy('username', 'username');

      expect(user.username).toBe('username');
    });
  });


  describe('FIND ONE BY OR', () => {
    test('should find a user with one of the given fields having the given value', async () => {
      mockingoose(User).toReturn(mockUser, 'findOne');

      const user = await UsersRepository.findOneByOr([{username: 'username'}, {id: 'id'}]);

      expect(user.username).toBe('username');
    });
  });
});
