const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const authService = require('../services/auth.service');
const tokenService = require('../services/token.service');
const Session = require('../models/Session.model');
const AuditLog = require('../models/AuditLog.model');
const { hashSHA256 } = require('../utils/crypto');

const getDeviceInfo = (req) => {
  return {
    ip: req.ip || req.connection.remoteAddress || 'unknown',
    userAgent: req.headers['user-agent'] || 'unknown',
  };
};

const register = catchAsync(async (req, res) => {
  const user = await authService.register(req.body);
  // Do not return password field
  const userObj = user.toObject();
  delete userObj.password;

  res.status(201).send(new ApiResponse(201, { user: userObj }, 'Registration successful. Verification OTP sent to your email.'));
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const deviceInfo = getDeviceInfo(req);
  const user = await authService.loginWithEmailAndPassword(email, password, deviceInfo);
  
  const tokens = await tokenService.generateAuthTokens(user, deviceInfo);

  // Log session
  const hashedToken = hashSHA256(tokens.refresh.token);
  await Session.create({
    userId: user._id,
    token: hashedToken,
    deviceInfo,
  });

  const userObj = user.toObject();
  delete userObj.password;

  res.send(new ApiResponse(200, { user: userObj, tokens }, 'Login successful'));
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.send(new ApiResponse(200, null, 'Logout successful'));
});

const refreshTokens = catchAsync(async (req, res) => {
  const deviceInfo = getDeviceInfo(req);
  const { user, tokens } = await authService.refreshAuth(req.body.refreshToken, deviceInfo);
  
  const userObj = user.toObject();
  delete userObj.password;

  res.send(new ApiResponse(200, { user: userObj, tokens }, 'Tokens refreshed successfully'));
});

const forgotPassword = catchAsync(async (req, res) => {
  await authService.forgotPassword(req.body.email);
  res.send(new ApiResponse(200, null, 'Password reset OTP sent to email'));
});

const resetPassword = catchAsync(async (req, res) => {
  const { email, otp, password } = req.body;
  await authService.resetPassword(email, otp, password);
  res.send(new ApiResponse(200, null, 'Password reset successful'));
});

const verifyEmail = catchAsync(async (req, res) => {
  const { email, otp } = req.body;
  const user = await authService.verifyEmailOTP(email, otp);
  
  const userObj = user.toObject();
  delete userObj.password;

  res.send(new ApiResponse(200, { user: userObj }, 'Email verified successfully'));
});

const sendOTP = catchAsync(async (req, res) => {
  await authService.sendLoginOTP(req.body.email);
  res.send(new ApiResponse(200, null, 'Login OTP sent to email'));
});

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  verifyEmail,
  sendOTP,
};
