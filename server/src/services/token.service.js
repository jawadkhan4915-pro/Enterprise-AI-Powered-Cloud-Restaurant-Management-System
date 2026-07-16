const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config/env');
const RefreshToken = require('../models/RefreshToken.model');
const { hashSHA256 } = require('../utils/crypto');

/**
 * Generate a JWT token
 * @param {mongoose.Types.ObjectId} userId 
 * @param {string} expires 
 * @param {string} secret 
 * @returns {string}
 */
const generateToken = (userId, expires, secret) => {
  const payload = {
    sub: userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.parse(expires) / 1000),
  };
  return jwt.sign(payload, secret);
};

/**
 * Save a refresh token to the database
 * @param {string} token 
 * @param {mongoose.Types.ObjectId} userId 
 * @param {Date} expiresAt 
 * @param {Object} deviceInfo 
 * @returns {Promise<RefreshToken>}
 */
const saveRefreshToken = async (token, userId, expiresAt, deviceInfo) => {
  const hashedToken = hashSHA256(token);
  return RefreshToken.create({
    userId,
    token: hashedToken,
    expiresAt,
    deviceInfo,
  });
};

/**
 * Generate authorization access & refresh tokens
 * @param {User} user 
 * @param {Object} deviceInfo 
 * @returns {Promise<Object>}
 */
const generateAuthTokens = async (user, deviceInfo) => {
  const accessExpires = new Date();
  // Parse JWT Access Expiration (e.g. 15m, 1h, 1d)
  const accessExpStr = config.jwt.accessExpiration;
  const accessAmount = parseInt(accessExpStr, 10);
  if (accessExpStr.endsWith('m')) {
    accessExpires.setMinutes(accessExpires.getMinutes() + accessAmount);
  } else if (accessExpStr.endsWith('h')) {
    accessExpires.setHours(accessExpires.getHours() + accessAmount);
  } else {
    accessExpires.setMinutes(accessExpires.getMinutes() + 15); // default 15 mins
  }

  const accessToken = generateToken(user._id, accessExpires, config.jwt.accessSecret);

  const refreshExpires = new Date();
  const refreshExpStr = config.jwt.refreshExpiration;
  const refreshAmount = parseInt(refreshExpStr, 10);
  if (refreshExpStr.endsWith('d')) {
    refreshExpires.setDate(refreshExpires.getDate() + refreshAmount);
  } else {
    refreshExpires.setDate(refreshExpires.getDate() + 7); // default 7 days
  }

  // Generate random bytes for refresh token
  const rawRefreshToken = crypto.randomBytes(40).toString('hex');
  const refreshToken = generateToken(user._id, refreshExpires, config.jwt.refreshSecret + rawRefreshToken);
  
  // Save combined/derived format
  const combinedToken = `${rawRefreshToken}.${refreshToken}`;
  await saveRefreshToken(combinedToken, user._id, refreshExpires, deviceInfo);

  return {
    access: {
      token: accessToken,
      expires: accessExpires,
    },
    refresh: {
      token: combinedToken,
      expires: refreshExpires,
    },
  };
};

/**
 * Generate a random reset token
 * @returns {string}
 */
const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

module.exports = {
  generateToken,
  generateAuthTokens,
  generateResetToken,
};
