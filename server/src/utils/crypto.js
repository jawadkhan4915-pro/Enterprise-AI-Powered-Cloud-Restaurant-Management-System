const crypto = require('crypto');

/**
 * Generate a random numeric OTP of a given length
 * @param {number} length 
 * @returns {string}
 */
const generateNumericOTP = (length = 6) => {
  const chars = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += chars[crypto.randomInt(0, 10)];
  }
  return otp;
};

/**
 * Hash a string using SHA256 (useful for OTPs, tokens)
 * @param {string} text 
 * @returns {string}
 */
const hashSHA256 = (text) => {
  return crypto.createHash('sha256').update(text).digest('hex');
};

module.exports = {
  generateNumericOTP,
  hashSHA256
};
