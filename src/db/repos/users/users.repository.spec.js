require('dotenv').config();
const db = require('../../index');
const User = process.env.ORM === 'MONGOOSE' ?
db.user :
require('../../models/sequelize/user.model');
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
      if (process.env.ORM === 'MONGOOSE') {
        mockingoose(User).toReturn(mockUser);
      }
      if (process.env.ORM === 'SEQUELIZE') {
        jest.spyOn(User, 'create').mockReturnValue(mockUser);
      }
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
      if (process.env.ORM === 'MONGOOSE') {
        mockingoose(User).toReturn(mockUpdateData, 'save');
      }
      if (process.env.ORM === 'SEQUELIZE') {
        jest.spyOn(User, 'update').mockReturnValue(mockUpdateData);
      }
      jest.spyOn(bcrypt, 'hashSync').mockReturnValue('updated password');

      const updatedUser = await UsersRepository.update(mockUser, mockUpdateData);

      expect(updatedUser.username).toBe('updated name');
      expect(updatedUser.password).toBe('updated password');
      expect(updatedUser.propToBeIgnored).toBeUndefined();
    });
  });

  describe('FIND ONE BY', () => {
    test('should find a user with the given field having the given value', async () => {
      if (process.env.ORM === 'MONGOOSE') {
        mockingoose(User).toReturn(mockUser, 'findOne');
      }
      if (process.env.ORM === 'SEQUELIZE') {
        jest.spyOn(User, 'findOne').mockReturnValue(mockUser);
      }

      const user = await UsersRepository.findOneBy('username', 'username');

      expect(user.username).toBe('username');
    });
  });


  describe('FIND ONE BY OR', () => {
    test('should find a user with one of the given fields having the given value', async () => {
      if (process.env.ORM === 'MONGOOSE') {
        mockingoose(User).toReturn(mockUser, 'findOne');
      }
      if (process.env.ORM === 'SEQUELIZE') {
        jest.spyOn(User, 'findOne').mockReturnValue(mockUser);
      }

      const user = await UsersRepository.findOneByOr([{username: 'username'}, {id: 'id'}]);

      expect(user.username).toBe('username');
    });
  });
});
