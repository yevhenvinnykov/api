const TokenMiddleware = require('./token.middleware');
const jwt = require('jsonwebtoken');

describe('TOKEN MIDDLEWARE', () => {
  let reqMock;
  let resMock;
  let nextMock;
  let statusSpy;
  let jsonSpy;
  let verifySpy;

  beforeEach(() => {
    reqMock = {headers: {'x-access-token': 'token'}};

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
    verifySpy = jest.spyOn(jwt, 'verify');
    verifySpy.mockImplementation((token, secretOrPublicKey, options, callback) => {
      return callback(null, {id: 'user_id'});
    });
  });

  describe('VERIFY TOKEN MIDDLEWARE', () => {
    test(`if the token is valid, next should be called and a userId should be added to the req`,
        () => {
          TokenMiddleware.verifyToken(reqMock, resMock, nextMock);

          expect(nextMock).toHaveBeenCalledTimes(1);
          expect(reqMock.userId).toBe('user_id');
        });

    test(`if no token, an error should be thrown and no userId should be added to the req`,
        () => {
          reqMock = {headers: {'x-access-token': null}};

          TokenMiddleware.verifyToken(reqMock, resMock, nextMock);

          expect(statusSpy).toHaveBeenCalledWith(400);
          expect(jsonSpy)
              .toHaveBeenCalledWith({'errors': {'Error: ': ['No token provided']}});
          expect(reqMock.userId).toBeUndefined();
        });
  });

  describe('VERIFY OPTIONAL TOKEN MIDDLEWARE', () => {
    test(`if the token is valid, next should be called and a userId should be added to the req`,
        () => {
          TokenMiddleware.verifyOptionalToken(reqMock, resMock, nextMock);

          expect(nextMock).toHaveBeenCalledTimes(1);
          expect(reqMock.userId).toBe('user_id');
        });

    test(`if no token, next should be called and no userId should be added to the req`,
        () => {
          reqMock = {headers: {'x-access-token': null}};

          TokenMiddleware.verifyOptionalToken(reqMock, resMock, nextMock);

          expect(nextMock).toHaveBeenCalledTimes(1);
          expect(reqMock.userId).toBeUndefined();
        });

    describe('IF JWT VERIFY THROWS ERROR', () => {
      beforeEach(() => {
        verifySpy.mockImplementation((token, secretOrPublicKey, options, callback) => {
          return callback({error: 'error'}, null);
        });
      });

      test('verifyToken shouldn\'t invoke next', () => {
        TokenMiddleware.verifyToken(reqMock, resMock, nextMock);
        expect(nextMock).toHaveBeenCalledTimes(0);
      });

      test('verifyOptionalToken shouldn\'t invoke next', () => {
        TokenMiddleware.verifyOptionalToken(reqMock, resMock, nextMock);
        expect(nextMock).toHaveBeenCalledTimes(0);
      });
    });
  });
});
