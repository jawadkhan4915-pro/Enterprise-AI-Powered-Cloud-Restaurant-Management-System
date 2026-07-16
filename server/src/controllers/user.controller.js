const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const userRepository = require('../repositories/user.repository');
const Session = require('../models/Session.model');
const AuditLog = require('../models/AuditLog.model');
const ApiError = require('../utils/ApiError');

const getProfile = catchAsync(async (req, res) => {
  const user = req.user.toObject();
  delete user.password;
  res.send(new ApiResponse(200, { user }, 'User profile retrieved successfully'));
});

const updateProfile = catchAsync(async (req, res) => {
  const user = await userRepository.updateUserById(req.user._id, req.body);
  const userObj = user.toObject();
  delete userObj.password;
  res.send(new ApiResponse(200, { user: userObj }, 'Profile updated successfully'));
});

const getSessions = catchAsync(async (req, res) => {
  const sessions = await Session.find({ userId: req.user._id, isActive: true })
    .select('deviceInfo lastActive createdAt')
    .sort({ lastActive: -1 });
  res.send(new ApiResponse(200, { sessions }, 'Active sessions retrieved'));
});

const deleteSession = catchAsync(async (req, res) => {
  const session = await Session.findOneAndUpdate(
    { _id: req.params.sessionId, userId: req.user._id, isActive: true },
    { isActive: false },
    { new: true }
  );

  if (!session) {
    throw new ApiError(404, 'Active session not found');
  }

  res.send(new ApiResponse(200, null, 'Session revoked successfully'));
});

const getActivityLogs = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const logs = await AuditLog.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await AuditLog.countDocuments({ userId: req.user._id });

  res.send(new ApiResponse(200, { logs }, 'Activity logs retrieved', {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
  }));
});

module.exports = {
  getProfile,
  updateProfile,
  getSessions,
  deleteSession,
  getActivityLogs,
};
