require('dotenv').config();
const ArticlesRepository = require('../../db/repos/articles/index');
const ArticleMiddleware = require('./article.middleware');

describe('CHECK IF ARTICLE TITLE IS UNIQUE', () => {
  let reqMock;
  let resMock;
  let nextMock;
  let statusSpy;
  let jsonSpy;

  beforeEach(() => {
    reqMock = {body: {article: {title: 'title'}}};

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

  test('when there\'s no article with such a title',
      async () => {
        jest.spyOn(ArticlesRepository, 'findOneBy').mockReturnValue(null);
        await ArticleMiddleware.checkIfTitleIsUnique(reqMock, resMock, nextMock);
        expect(nextMock).toHaveBeenCalledTimes(1);
      });

  test(`should send the response with a corresponding
        error when the article\'s title is not unique`,
  async () => {
    jest.spyOn(ArticlesRepository, 'findOneBy')
        .mockReturnValue({title: 'title'});
    await ArticleMiddleware.checkIfTitleIsUnique(reqMock, resMock, nextMock);
    expect(nextMock).toHaveBeenCalledTimes(0);
    expect(statusSpy).toHaveBeenCalledWith(400);
    expect(jsonSpy).toHaveBeenCalledWith({
      'errors': {'Error: ': ['Article with this title already exists']},
    });
  });
});
