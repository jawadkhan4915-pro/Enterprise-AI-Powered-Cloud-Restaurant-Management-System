const jwt = require('jsonwebtoken');
const config = require('../config/env');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const userRepository = require('../repositories/user.repository');

const auth = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Please authenticate');
  }

  try {
    const decoded = jwt.verify(token, config.jwt.accessSecret);
    const user = await userRepository.findById(decoded.sub);

    if (!user) {
      throw new ApiError(401, 'User not found or has been deleted');
    }

    if (!user.isActive) {
      throw new ApiError(403, 'User account is deactivated');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Access token expired');
    }
    throw new ApiError(401, 'Please authenticate');
  }
});

module.exports = auth;
