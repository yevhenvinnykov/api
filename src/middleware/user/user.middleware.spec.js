require('dotenv').config();
const UserMiddleware = require('./user.middleware');
const UsersRepository = require('../../db/repos/users/index');

describe('USER MIDDLEWARE', () => {
  let reqMock;
  let resMock;
  let nextMock;
  let statusSpy;
  let jsonSpy;

  beforeEach(() => {
    reqMock = {body: {user: {email: 'email@email.com', username: 'username'}}};

    resMock = {
      status() {
        return this;
      },
      json() { },
    };

    nextMock = jest.fn();
  });

  beforeEach(() => {
    statusSpy = jest.spyOn(resMock, 'status');
    jsonSpy = jest.spyOn(resMock, 'json');
  });


  describe('CHECK IF USER EXISTS', () => {
    test('when no user with the email/username is found, next should be called', async () => {
      reqMock = {body: {user: {email: null, username: null}}};
      jest.spyOn(UsersRepository, 'findOneByOr').mockReturnValue(null);

      await UserMiddleware.checkIfUserExists(reqMock, resMock, nextMock);

      expect(nextMock).toHaveBeenCalledTimes(1);
    });

    test('when there\'s a user with such an email, res with corresponding error should be sent',
        async () => {
          jest.spyOn(UsersRepository, 'findOneByOr')
              .mockReturnValue({username: 'user', email: 'email@email.com'});
          try {
            await UserMiddleware.checkIfUserExists(reqMock, resMock, nextMock);
          } catch (error) {
            expect(statusSpy).toHaveBeenCalledWith(400);
            expect(jsonSpy).toHaveBeenCalledWith(
                {'errors': {'Error: ': ['User with this email already exists']}},
            );
            expect(nextMock).toHaveBeenCalledTimes(0);
          }
        });

    test('when there\'s a user with such a username, res with corresponding error should be sent',
        async () => {
          jest.spyOn(UsersRepository, 'findOneByOr')
              .mockReturnValue({username: 'username', email: 'testemail'});
          try {
            await UserMiddleware.checkIfUserExists(reqMock, resMock, nextMock);
          } catch (error) {
            expect(statusSpy).toHaveBeenCalledWith(400);
            expect(jsonSpy).toHaveBeenCalledWith(
                {'errors': {'Error: ': ['User with this username already exists']}},
            );
            expect(nextMock).toHaveBeenCalledTimes(0);
          }
        });
  });

  describe('VALIDATE EMAIL', () =>{
    test('when there\'s no email in req, next should be called', () => {
      reqMock = {body: {user: {email: null}}};
      UserMiddleware.validateEmail(reqMock, resMock, nextMock);

      expect(nextMock).toHaveBeenCalledTimes(1);
    });

    test('when email is invalid, res with corresponding error should be sent', () => {
      reqMock = {body: {user: {email: '@!.invalidemail.com'}}};
      UserMiddleware.validateEmail(reqMock, resMock, nextMock);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy)
          .toHaveBeenCalledWith({'errors': {'Error: ': ['Enter a valid email']}});
      expect(nextMock).toHaveBeenCalledTimes(0);
    });

    test('when email is valid, next should be called', () => {
      UserMiddleware.validateEmail(reqMock, resMock, nextMock);
      expect(nextMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('VALIDATE PASSWORD', () => {
    test('when there\'s no password in req, next should be called', () => {
      UserMiddleware.validatePassword(reqMock, resMock, nextMock);
      expect(nextMock).toHaveBeenCalledTimes(1);
    });

    test('when password is invalid, res with corresponding error should be sent', () => {
      reqMock = {body: {user: {password: 'test'}}};
      UserMiddleware.validatePassword(reqMock, resMock, nextMock);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        'errors': {'Error: ':
                      [
                        'Password must be between 6 and 25 characters long',
                        'Password must contain at least one digit',
                        'Password must contain at least one capital letter',
                      ],
        },
      });
      expect(nextMock).toHaveBeenCalledTimes(0);
    });

    test('when password is valid, next should be called', () => {
      reqMock = {body: {user: {password: 'Validpassword1'}}};
      UserMiddleware.validatePassword(reqMock, resMock, nextMock);

      expect(nextMock).toHaveBeenCalledTimes(1);
    });
  });
});
