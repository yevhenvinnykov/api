const mockingoose = require('mockingoose');
const db = require('../../../src/models');
const User = db.user;
const { checkIfUserExists } = require('../../../src/middleware/user.middleware');

describe('CheckIfUserExists', () => {

    let reqMock, resMock, nextMock;
    let statusSpy, sendSpy;

    beforeEach(() => {
        reqMock = { body: { user: { email: 'email', username: 'username' } } };

        resMock = {
            status() { return this },
            send() { }
        };

        nextMock = jest.fn();
        statusSpy = jest.spyOn(resMock, 'status');
        sendSpy = jest.spyOn(resMock, 'send');
    });

    describe('check email', () => {

        test('when there\'s no email in req, next should be called', () => {
            reqMock = { body: { user: { email: null } } };
            checkIfUserExists(reqMock, resMock, nextMock);
            expect(nextMock).toHaveBeenCalledTimes(1);
        });

        test('when there\'s been an error, res with error shold be sent', () => {
            mockingoose(User).toReturn(new Error, 'findOne');
            checkIfUserExists(reqMock, resMock, nextMock);
            expect(statusSpy).toHaveBeenCalledWith(500);
            expect(sendSpy).toHaveBeenCalledWith({ "errors": { "Error: ": ["Something went wrong"] } })
            expect(nextMock).toHaveBeenCalledTimes(0);
        });

        test('when there\'s a user with such an email, res with corresponding error should be sent', () => {
            mockingoose(User).toReturn({ user: 'user' }, 'findOne');
            checkIfUserExists(reqMock, resMock, nextMock);
            expect(statusSpy).toHaveBeenCalledWith(400);
            expect(sendSpy).toHaveBeenCalledWith({ "errors": { "Error: ": ["User with this email already exists"] } })
            expect(nextMock).toHaveBeenCalledTimes(0);
        });

    });


    describe('check username', () => {

        test('when there\'s no username in req, next should be called', async () => {
            mockingoose(User).toReturn(null, 'findOne');
            reqMock = { body: { user: { email: 'email', username: null } } };
            await checkIfUserExists(reqMock, resMock, nextMock);
            expect(nextMock).toHaveBeenCalledTimes(1);
        });

        // THESE TWO WON'T PASS SINCE MOCKINGOOSE HAS TO RETURN VALUES TWICE

        // test('when there\'s been an error, res with error shold be sent', () => {
        //     mockingoose(User).toReturn(new Error, 'findOne');
        //     reqMock = { body: { user: { email: 'email', username: 'user' } } };
        //     checkIfUserExists(reqMock, resMock, nextMock);
        //     expect(statusSpy).toHaveBeenCalledWith(500);
        //     expect(sendSpy).toHaveBeenCalledWith({ "errors": { "Error: ": ["Something went wrong"] } })
        //     expect(nextMock).toHaveBeenCalledTimes(0);
        // });


        // test('when there\'s a user with such a username, res with corresponding error should be sent', () => {
        //     mockingoose(User).toReturn({user: 'user'}, 'findOne');
        //     reqMock = { body: { user: { email: 'email', username: 'user' } } };
        //     checkIfUserExists(reqMock, resMock, nextMock);
        //     mockingoose(User).toReturn({ user: 'user' }, 'findOne');
        //     expect(statusSpy).toHaveBeenCalledWith(400);
        //     expect(sendSpy).toHaveBeenCalledWith({ "errors": { "Error: ": ["User with this email already exists"] } })
        //     expect(nextMock).toHaveBeenCalledTimes(0);
        // });

    });

});