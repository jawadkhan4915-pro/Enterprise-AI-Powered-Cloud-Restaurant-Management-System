const userRepository = require('../repositories/user.repository');
const RefreshToken = require('../models/RefreshToken.model');
const OTP = require('../models/OTP.model');
const Session = require('../models/Session.model');
const AuditLog = require('../models/AuditLog.model');
const ApiError = require('../utils/ApiError');
const { hashSHA256, generateNumericOTP } = require('../utils/crypto');
const emailService = require('./email.service');
const tokenService = require('./token.service');

/**
 * Register a user
 * @param {Object} userBody 
 * @returns {Promise<User>}
 */
const register = async (userBody) => {
  if (await userRepository.findByEmail(userBody.email)) {
    throw new ApiError(400, 'Email already taken');
  }

  // First user registered is super_admin, others are waiters by default (or can be configured)
  const isFirstUser = (await userRepository.findByEmail('')) === null; // check if any users exist
  const existingUsersCount = await require('../models/User.model').countDocuments({ isDeleted: false });
  const role = existingUsersCount === 0 ? 'super_admin' : (userBody.role || 'waiter');

  const userData = {
    ...userBody,
    role,
  };

  const user = await userRepository.createUser(userData);

  // Log audit action
  await AuditLog.create({
    userId: user._id,
    action: 'REGISTER',
    resource: 'User',
    resourceId: user._id.toString(),
    metadata: { email: user.email },
  });

  // Generate Email Verification OTP
  const otpCode = generateNumericOTP(6);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
  const hashedOtp = hashSHA256(otpCode);

  await OTP.create({
    userId: user._id,
    code: hashedOtp,
    type: 'email_verification',
    expiresAt,
  });

  // Send verification email (will log to console if SMTP not config'd)
  await emailService.sendVerificationEmail(user.email, user.name, otpCode);

  return user;
};

/**
 * Login with email and password
 * @param {string} email 
 * @param {string} password 
 * @param {Object} deviceInfo 
 * @returns {Promise<User>}
 */
const loginWithEmailAndPassword = async (email, password, deviceInfo) => {
  const user = await userRepository.findByEmail(email);
  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(401, 'Incorrect email or password');
  }
  if (!user.isActive) {
    throw new ApiError(403, 'Your account has been deactivated');
  }

  // Update login stats
  user.loginCount += 1;
  user.lastLogin = new Date();
  // Keep up to 10 device history entries
  user.deviceHistory.push({
    ip: deviceInfo.ip,
    userAgent: deviceInfo.userAgent,
    loginAt: new Date(),
  });
  if (user.deviceHistory.length > 10) {
    user.deviceHistory.shift();
  }
  await user.save();

  // Audit login
  await AuditLog.create({
    userId: user._id,
    action: 'LOGIN',
    resource: 'Auth',
    ip: deviceInfo.ip,
    userAgent: deviceInfo.userAgent,
  });

  return user;
};

/**
 * Perform logout
 * @param {string} refreshToken 
 * @returns {Promise}
 */
const logout = async (refreshToken) => {
  const hashedToken = hashSHA256(refreshToken);
  const refreshTokenDoc = await RefreshToken.findOne({
    token: hashedToken,
    isRevoked: false,
  });

  if (!refreshTokenDoc) {
    throw new ApiError(404, 'Refresh token not found');
  }

  // Revoke token
  refreshTokenDoc.isRevoked = true;
  await refreshTokenDoc.save();

  // Deactivate active session if any matches
  await Session.findOneAndUpdate(
    { token: hashedToken },
    { isActive: false }
  );

  // Audit log
  await AuditLog.create({
    userId: refreshTokenDoc.userId,
    action: 'LOGOUT',
    resource: 'Auth',
  });
};

/**
 * Refresh auth tokens
 * @param {string} refreshToken 
 * @param {Object} deviceInfo 
 * @returns {Promise<Object>}
 */
const refreshAuth = async (refreshToken, deviceInfo) => {
  try {
    const hashedToken = hashSHA256(refreshToken);
    const refreshTokenDoc = await RefreshToken.findOne({
      token: hashedToken,
      isRevoked: false,
    });

    if (!refreshTokenDoc) {
      throw new ApiError(401, 'Invalid refresh token');
    }

    if (refreshTokenDoc.expiresAt < new Date()) {
      throw new ApiError(401, 'Refresh token expired');
    }

    const user = await userRepository.findById(refreshTokenDoc.userId);
    if (!user || !user.isActive) {
      throw new ApiError(401, 'Authentication failed');
    }

    // Generate new tokens
    const tokens = await tokenService.generateAuthTokens(user, deviceInfo);

    // Revoke old refresh token
    refreshTokenDoc.isRevoked = true;
    await refreshTokenDoc.save();

    // Create session tracking
    const newHashedToken = hashSHA256(tokens.refresh.token);
    await Session.create({
      userId: user._id,
      token: newHashedToken,
      deviceInfo,
    });

    // Update old session
    await Session.findOneAndUpdate(
      { token: hashedToken },
      { isActive: false }
    );

    return { user, tokens };
  } catch (error) {
    throw new ApiError(401, 'Please authenticate');
  }
};

/**
 * Send password reset email
 * @param {string} email 
 * @returns {Promise}
 */
const forgotPassword = async (email) => {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw new ApiError(404, 'No user found with this email');
  }

  // Generate Reset OTP
  const otpCode = generateNumericOTP(6);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
  const hashedOtp = hashSHA256(otpCode);

  // Clear existing password reset tokens for this user
  await OTP.deleteMany({ userId: user._id, type: 'password_reset' });

  await OTP.create({
    userId: user._id,
    code: hashedOtp,
    type: 'password_reset',
    expiresAt,
  });

  await emailService.sendResetPasswordEmail(user.email, user.name, otpCode);

  await AuditLog.create({
    userId: user._id,
    action: 'FORGOT_PASSWORD_REQUEST',
    resource: 'Auth',
  });
};

/**
 * Reset password
 * @param {string} email 
 * @param {string} otpCode 
 * @param {string} newPassword 
 * @returns {Promise}
 */
const resetPassword = async (email, otpCode, newPassword) => {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw new ApiError(404, 'No user found with this email');
  }

  const hashedOtp = hashSHA256(otpCode);
  const otpDoc = await OTP.findOne({
    userId: user._id,
    code: hashedOtp,
    type: 'password_reset',
  });

  if (!otpDoc || otpDoc.expiresAt < new Date()) {
    throw new ApiError(400, 'Invalid or expired OTP code');
  }

  // Update password
  user.password = newPassword;
  await user.save();

  // Delete OTP
  await OTP.deleteOne({ _id: otpDoc._id });

  // Delete all refresh tokens for security on password change
  await RefreshToken.deleteMany({ userId: user._id });
  await Session.updateMany({ userId: user._id }, { isActive: false });

  await AuditLog.create({
    userId: user._id,
    action: 'PASSWORD_RESET_SUCCESS',
    resource: 'Auth',
  });
};

/**
 * Verify User Email via OTP Code
 * @param {string} email 
 * @param {string} otpCode 
 * @returns {Promise<User>}
 */
const verifyEmailOTP = async (email, otpCode) => {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const hashedOtp = hashSHA256(otpCode);
  const otpDoc = await OTP.findOne({
    userId: user._id,
    code: hashedOtp,
    type: 'email_verification',
  });

  if (!otpDoc || otpDoc.expiresAt < new Date()) {
    throw new ApiError(400, 'Invalid or expired verification OTP');
  }

  user.isEmailVerified = true;
  await user.save();

  // Clear OTP
  await OTP.deleteOne({ _id: otpDoc._id });

  await AuditLog.create({
    userId: user._id,
    action: 'EMAIL_VERIFIED',
    resource: 'User',
  });

  return user;
};

/**
 * Send general login/verification OTP
 * @param {string} email 
 * @returns {Promise}
 */
const sendLoginOTP = async (email) => {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const otpCode = generateNumericOTP(6);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  const hashedOtp = hashSHA256(otpCode);

  await OTP.deleteMany({ userId: user._id, type: 'login_2fa' });
  await OTP.create({
    userId: user._id,
    code: hashedOtp,
    type: 'login_2fa',
    expiresAt,
  });

  await emailService.sendOTPEmail(user.email, user.name, otpCode);
};

module.exports = {
  register,
  loginWithEmailAndPassword,
  logout,
  refreshAuth,
  forgotPassword,
  resetPassword,
  verifyEmailOTP,
  sendLoginOTP,
};
