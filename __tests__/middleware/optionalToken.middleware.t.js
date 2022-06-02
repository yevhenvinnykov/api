const { verifyOptionalToken } = require('../../middleware/optionalToken.middleware');

jest.mock('jsonwebtoken', () => ({
    verify: jest.fn((token, secretOrPublicKey, options, callback) => {
        return callback(null, { id: 'user_id' });
    })
}));

describe('VerifyOptionalToken', () => {
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

    test('when there\'s no token, next should be called and no userId should be added to the req', () => {
        reqMock = { headers: { 'x-access-token': null } };
        verifyOptionalToken(reqMock, resMock, nextMock);
        expect(nextMock).toHaveBeenCalledTimes(1);
        expect(reqMock.userId).toBeUndefined();
    });

    test('when there\'s a token, next should be called and a userId should be added to the req', async () => {
        await verifyOptionalToken(reqMock, resMock, nextMock);
        expect(nextMock).toHaveBeenCalledTimes(1);
        expect(reqMock.userId).toBe('user_id');
    });

});

