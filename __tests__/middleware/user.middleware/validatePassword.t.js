const { validatePassword } = require('../../../middleware/user.middleware');

describe('ValidatePassword', () => {
    let reqMock, resMock, nextMock;
    let statusSpy, sendSpy;

    beforeEach(() => {
        reqMock = { body: { user: { password: null } } };

        resMock = {
            status() { return this },
            send() { }
        };

        nextMock = jest.fn();
        statusSpy = jest.spyOn(resMock, 'status');
        sendSpy = jest.spyOn(resMock, 'send');
    });


    test('when there\'s no password in req, next should be called', () => {
        validatePassword(reqMock, resMock, nextMock);
        expect(nextMock).toHaveBeenCalledTimes(1);
    });

    test('when password is invalid, res with corresponding error should be sent', () => {
        reqMock = { body: { user: { password: 'test' } } };
        validatePassword(reqMock, resMock, nextMock);
        expect(statusSpy).toHaveBeenCalledWith(400);
        expect(sendSpy).toHaveBeenCalledWith({
            "errors": {
                "Error: ":
                    [
                        "Password must be between 6 and 25 characters long",
                        "Password must contain at least one digit",
                        "Password must contain at least one capital letter"
                    ]
            }
        });
        expect(nextMock).toHaveBeenCalledTimes(0);
    });

    test('when password is valid, next should be called', () => {
        reqMock = { body: { user: { password: 'Validpassword1' } } };
        validatePassword(reqMock, resMock, nextMock);
        expect(nextMock).toHaveBeenCalledTimes(1);
    });


});