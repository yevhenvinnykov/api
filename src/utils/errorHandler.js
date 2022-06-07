class NotFoundError extends Error {
  constructor(message) {
    const trueProto = new.target.prototype;
    super(message);
    this.__proto__ = trueProto;
    this.message = message;
  }
}

class BadRequestError extends Error {
  constructor(message) {
    const trueProto = new.target.prototype;
    super(message);
    this.__proto__ = trueProto;
    this.message = message;
  }
}

class ErrorHandler {
  static catchError(res, err) {
    if (err.constructor.name === 'NotFoundError') {
      console.log(err);
      return res.status(404)
          .json(ErrorHandler.createErrorResponse(err.message || 'DB Error'));
    }

    if (err.constructor.name === 'BadRequestError') {
      console.log(err);
      return res.status(400)
          .json(ErrorHandler.createErrorResponse(err.message || 'DB error'));
    }
    console.log(err);
    return res.status(500)
        .json(ErrorHandler.createErrorResponse(
            err.message || 'Internal Server Error',
        ));
  }

  static createErrorResponse(error) {
    const errorArray = Array.isArray(error) ? error : [error];
    const errorResponse = {
      errors: {
        'Error: ': [],
      },
    };
    for (const message of errorArray) {
      errorResponse.errors['Error: '].push(message);
    }
    return errorResponse;
  }
}

module.exports = {
  NotFoundError,
  BadRequestError,
  ErrorHandler,
};
