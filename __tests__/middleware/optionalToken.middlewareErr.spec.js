const { verifyOptionalToken } = require('../../src/middleware/optionalToken.middleware');

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn((token, secretOrPublicKey, options, callback) => {
    return callback({ error: 'error' }, { id: null });
  })
}));

describe('VerifyOptionalToken with Error', () => {
  let reqMock, resMock, nextMock;
  let statusSpy, sendSpy;

  beforeEach(() => {
    reqMock = { headers: { 'x-access-token': 'token' } };
    resMock = {
      status() { return this },
      send() { }
    };

    nextMock = jest.fn();
    statusSpy = jest.spyOn(resMock, 'status');
    sendSpy = jest.spyOn(resMock, 'send');
  });

  test('when there\'s an invalid token, res with error should be sent', () => {
    verifyOptionalToken(reqMock, resMock, nextMock);
    expect(statusSpy).toHaveBeenCalledWith(401);
    expect(sendSpy).toHaveBeenCalledWith({ "errors": { "Error: ": ["You are not authorized"] } });
    expect(reqMock.userId).toBeUndefined();
  });

});


