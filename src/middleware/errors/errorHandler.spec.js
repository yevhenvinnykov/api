const {
  ErrorHandler,
  NotFoundError,
  BadRequestError,
} = require('./errorHandler');

describe('ERROR HANDLER', () => {
  let statusSpy;
  let jsonSpy;
  let res;
  beforeEach(() => {
    res = {
      status: function() {
        return this;
      },
      json: () => {}};
    statusSpy = jest.spyOn(res, 'status');
    jsonSpy = jest.spyOn(res, 'json');
  });

  describe('CATCH ERROR', () => {
    test('should catch a NotFoundError and send it to client', () => {
      ErrorHandler.catchError(res, new NotFoundError());
      expect(statusSpy).toHaveBeenCalledWith(404);
      const errorResponse = {
        errors: {
          'Error: ': ['DB Error'],
        },
      };
      expect(jsonSpy).toHaveBeenCalledWith(errorResponse);
    });

    test('should catch a BadRequestError and send it to client', () => {
      ErrorHandler.catchError(res, new BadRequestError());
      expect(statusSpy).toHaveBeenCalledWith(400);
      const errorResponse = {
        errors: {
          'Error: ': ['DB Error'],
        },
      };
      expect(jsonSpy).toHaveBeenCalledWith(errorResponse);
    });
  });

  test('should catch any other error and send it to client', () => {
    ErrorHandler.catchError(res, [new Error()]);
    expect(statusSpy).toHaveBeenCalledWith(500);
    const errorResponse = {
      errors: {
        'Error: ': ['Internal Server Error'],
      },
    };
    expect(jsonSpy).toHaveBeenCalledWith(errorResponse);
  });
});

