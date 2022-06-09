const jwt = require('jsonwebtoken');
const {ErrorHandler, BadRequestError} = require('./errors/errorHandler');

verifyOptionalToken = (req, res, next) => {
  try {
    const token = req.headers['x-access-token'];
    if (!token) return next();
    jwt.verify(token, process.env.JWT_SECRET, {
      expiresIn: 3600,
    }, (err, decoded) => {
      if (err) throw new BadRequestError('You are not authorized');
      req.userId = decoded.id;
      next();
    });
  } catch (error) {
    ErrorHandler.catchError(res, error);
  }
};

module.exports = {
  verifyOptionalToken,
};
