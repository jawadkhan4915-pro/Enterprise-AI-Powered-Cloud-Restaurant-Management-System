const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = errors.array().map((err) => `${err.path}: ${err.msg}`).join(', ');
  return next(new ApiError(400, extractedErrors));
};

module.exports = validate;
