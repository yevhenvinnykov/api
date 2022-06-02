const mockingoose = require('mockingoose');
const db = require('../../models');
const Article = db.article;
const { checkIfArticleTitleIsUnique } = require('../../middleware/article.middleware');

describe('CheckIfArticleTitleIsUnique', () => {
    let reqMock, resMock, nextMock;
    let statusSpy, sendSpy;

    beforeEach(() => {
        reqMock = { body: { article: { title: 'title' } } };

        resMock = {
            status() { return this },
            send() { }
        };

        nextMock = jest.fn();
        statusSpy = jest.spyOn(resMock, 'status');
        sendSpy = jest.spyOn(resMock, 'send');
    });

    test('when there\'s no article with such a title and no error, next should be called', async () => {
        mockingoose(Article).toReturn(null, 'findOne');
        await checkIfArticleTitleIsUnique(reqMock, resMock, nextMock);
        expect(nextMock).toHaveBeenCalledTimes(1);
    });

    test('should send a response with corresponding error when article\'s title is not unique', async () => {
        mockingoose(Article).toReturn({ title: 'title' }, 'findOne');
        await checkIfArticleTitleIsUnique(reqMock, resMock, nextMock);
        expect(nextMock).toHaveBeenCalledTimes(0);
        expect(statusSpy).toHaveBeenCalledWith(400);
        expect(sendSpy)
            .toHaveBeenCalledWith({ "errors": { "Error: ": ["Article with this title already exists"] } });
    });

    test('should send a response with corresponding error when there\'s been an error', async () => {
        mockingoose(Article).toReturn(new Error, 'findOne');
        await checkIfArticleTitleIsUnique(reqMock, resMock, nextMock);
        expect(nextMock).toHaveBeenCalledTimes(0);
        expect(statusSpy).toHaveBeenCalledWith(500);
        expect(sendSpy).toHaveBeenCalledWith({ "errors": { "Error: ": ["Something went wrong"] } });
    });

});