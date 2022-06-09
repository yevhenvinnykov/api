const TokenMiddleware = require('./token.middleware');

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn((token, secretOrPublicKey, options, callback) => {
    return callback(null, {id: 'user_id'});
  }),
}));

describe('TOKEN MIDDLEWARE', () => {
  let reqMock;
  let resMock;
  let nextMock;
  let statusSpy;
  let jsonSpy;

  beforeEach(() => {
    reqMock = {headers: {'x-access-token': 'token'}};
    resMock = {
      status() {
        return this;
      },
      json() { },
    };

    nextMock = jest.fn();
    statusSpy = jest.spyOn(resMock, 'status');
    jsonSpy = jest.spyOn(resMock, 'json');
  });

  test(`when there\'s a token, next should be called
  and a userId should be added to the req`,
  () => {
    TokenMiddleware.verifyToken(reqMock, resMock, nextMock);
    expect(nextMock).toHaveBeenCalledTimes(1);
    expect(reqMock.userId).toBe('user_id');
  });

  test(`when there\'s no token, next should be called
        and no userId should be added to the req`,
  () => {
    reqMock = {headers: {'x-access-token': null}};
    TokenMiddleware.verifyToken(reqMock, resMock, nextMock);
    expect(statusSpy).toHaveBeenCalledWith(400);
    expect(jsonSpy)
        .toHaveBeenCalledWith({'errors': {'Error: ': ['No token provided']}});
    expect(reqMock.userId).toBeUndefined();
  });
});
