require('dotenv').config();
const db = require('../../index');
const User = process.env.ORM === 'MONGOOSE'
? db.user
: require('../../models/sequelize/user.model');
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
      following: [],
      save: () => {},
    };
  });

  beforeEach(() => {
    if (process.env.ORM === 'MONGOOSE') {
      jest.spyOn(User, 'findOne').mockReturnValue({select: () => ({exec: () => mockUser})});
    }
    if (process.env.ORM === 'SEQUELIZE') {
      jest.spyOn(User, 'findOne').mockReturnValue(mockUser);
    }
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

      jest.spyOn(bcrypt, 'hashSync').mockReturnValue('updated password');

      await UsersRepository.update(1, mockUpdateData);

      expect(mockUser.username).toBe('updated name');
      expect(mockUser.password).toBe('updated password');
      expect(mockUser.propToBeIgnored).toBeUndefined();
    });
  });

  describe('FIND ONE BY', () => {
    test('should find a user with the given field having the given value', async () => {
      const user = await UsersRepository.findOneBy('username', 'username');

      expect(user.username).toBe(mockUser.username);
    });
  });


  describe('FIND ONE BY OR', () => {
    test('should find a user with one of the given fields having the given value', async () => {
      const user = await UsersRepository.findOneByOr([{username: 'username'}, {id: 'id'}]);

      expect(user.username).toBe(mockUser.username);
    });
  });

  describe('FOLLOW', () => {
    test('should push the id to authUsers\'s following array', async () => {
      mockUser.save = async function() {
        this.following = [2];
      };
      if (process.env.ORM === 'SEQUELIZE') {
        jest.spyOn(User, 'update').mockImplementation(() => mockUser.following = [2]);
      }
      await UsersRepository.follow(1, 2);

      expect(mockUser.following).toEqual([2]);
    });
  });

  describe('UNFOLLOW', () => {
    test('should delete the id from authUsers\'s following array', async () => {
      mockUser.save = async function() {
        this.following = [];
      };
      if (process.env.ORM === 'SEQUELIZE') {
        jest.spyOn(User, 'update').mockImplementation(() => mockUser.following = []);
      }
      await UsersRepository.unfollow(1, 2);

      expect(mockUser.following).toEqual([]);
    });
  });
});
