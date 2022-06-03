const db = require('../../../src/models');
const User = db.user;
const { getProfile } = require('../../../src/controllers/profiles.controller');
const mockingoose = require('mockingoose');

describe('GetProfile', () => {
    let reqMock, resMock;
    let statusSpy, sendSpy;

    beforeEach(() => {
        reqMock = { userId: '123', params: { username: 'username' } };

        resMock = {
            status() { return this },
            send() { }
        };

        statusSpy = jest.spyOn(resMock, 'status');
        sendSpy = jest.spyOn(resMock, 'send');
    });

    test('getProfile', () => {
        mockingoose(User)
        .toReturn({user: 'user'}, 'findOne')
        .toReturn({user: 'user'}, 'findOne');
        getProfile(reqMock, resMock);
        expect(statusSpy).toHaveBeenCalledWith(200);
        expect(sendSpy).toHaveBeenCalledWith('');   
    });
});
