const { validateEmail } = require('../../../middleware/user.middleware');

describe('ValidateEmail', () => {
    let reqMock, resMock, nextMock;
    let statusSpy, sendSpy;

    beforeEach(() => {
        reqMock = { body: { user: { email: 'validemail@email.com' } } };

        resMock = {
            status() { return this },
            send() { }
        };

        nextMock = jest.fn();
        statusSpy = jest.spyOn(resMock, 'status');
        sendSpy = jest.spyOn(resMock, 'send');
    });

    test('when there\'s no email in req, next should be called', () => {
        reqMock = { body: { user: { email: null } } };
        validateEmail(reqMock, resMock, nextMock);
        expect(nextMock).toHaveBeenCalledTimes(1);
    });

    test('when email is invalid, res with corresponding error should be sent', () => {
        reqMock = { body: { user: { email: '@!.ivalidemail.com' } } };
        validateEmail(reqMock, resMock, nextMock);
        expect(statusSpy).toHaveBeenCalledWith(400);
        expect(sendSpy).toHaveBeenCalledWith({ "errors": { "Error: ": ["Invalid email"] } });
        expect(nextMock).toHaveBeenCalledTimes(0);
    });

    test('when email is valid, next should be called', () => {
        validateEmail(reqMock, resMock, nextMock);
        expect(nextMock).toHaveBeenCalledTimes(1);
    });

});
