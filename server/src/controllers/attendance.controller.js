const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const attendanceRepo = require('../repositories/attendance.repository');
const Employee = require('../models/Employee.model');

// Helper to get local date in YYYY-MM-DD
const getLocalDateString = () => {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  const localDate = new Date(d.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 10);
};

// Helper to find Employee associated with user
const findEmployeeForUser = async (userId) => {
  const employee = await Employee.findOne({ userId, isDeleted: false });
  if (!employee) {
    throw new ApiError(404, 'Employee record not found for this user account.');
  }
  return employee;
};

// Calculate worked hours and overtime based on check-in, check-out, and breaks
const calculateAttendanceMetrics = (clockIn, clockOut, breaks, shift) => {
  const inTime = new Date(clockIn);
  const outTime = clockOut ? new Date(clockOut) : new Date();

  let totalMs = outTime - inTime;
  let breakMs = 0;

  if (breaks && breaks.length > 0) {
    breaks.forEach((b) => {
      if (b.start) {
        const start = new Date(b.start);
        const end = b.end ? new Date(b.end) : new Date();
        breakMs += (end - start);
      }
    });
  }

  const netMs = Math.max(0, totalMs - breakMs);
  const totalHours = Math.round((netMs / (1000 * 60 * 60)) * 100) / 100;

  // Calculate standard shift hours
  let standardHours = 8; // Default
  if (shift && shift.start && shift.end) {
    const [startHour, startMin] = shift.start.split(':').map(Number);
    const [endHour, endMin] = shift.end.split(':').map(Number);
    let diff = (endHour + endMin / 60) - (startHour + startMin / 60);
    if (diff < 0) diff += 24; // Handle overnight shifts
    standardHours = Math.round(diff * 100) / 100;
  }

  const overtimeHours = totalHours > standardHours ? Math.round((totalHours - standardHours) * 100) / 100 : 0;

  return { totalHours, overtimeHours };
};

const getTodayStatus = catchAsync(async (req, res) => {
  const employee = await Employee.findOne({ userId: req.user._id, isDeleted: false });
  const dateStr = getLocalDateString();
  let log = null;
  if (employee) {
    log = await attendanceRepo.findTodayRecord(employee._id, dateStr);
  }

  res.send(new ApiResponse(200, { employee: employee || null, attendance: log }, 'Today attendance status retrieved'));
});

const clockIn = catchAsync(async (req, res) => {
  const employee = await findEmployeeForUser(req.user._id);
  const dateStr = getLocalDateString();

  let existing = await attendanceRepo.findTodayRecord(employee._id, dateStr);
  if (existing) {
    throw new ApiError(400, 'You have already clocked in for today.');
  }

  // Determine late status based on shift start
  let status = 'present';
  const now = new Date();
  if (employee.shift && employee.shift.start) {
    const [shiftHour, shiftMin] = employee.shift.start.split(':').map(Number);
    const shiftTimeToday = new Date();
    shiftTimeToday.setHours(shiftHour, shiftMin, 0, 0);

    // If checked in > 15 minutes after shift start, mark as late
    if (now.getTime() - shiftTimeToday.getTime() > 15 * 60 * 1000) {
      status = 'late';
    }
  }

  const log = await attendanceRepo.createRecord({
    employeeId: employee._id,
    date: dateStr,
    clockIn: now,
    status,
  });

  res.status(201).send(new ApiResponse(201, { attendance: log }, 'Clocked in successfully'));
});

const clockOut = catchAsync(async (req, res) => {
  const employee = await findEmployeeForUser(req.user._id);
  const dateStr = getLocalDateString();

  let log = await attendanceRepo.findTodayRecord(employee._id, dateStr);
  if (!log) {
    throw new ApiError(400, 'No clock-in record found for today.');
  }
  if (log.clockOut) {
    throw new ApiError(400, 'You have already clocked out for today.');
  }

  // Check for active breaks
  const activeBreak = log.breaks.find(b => b.end === null);
  if (activeBreak) {
    throw new ApiError(400, 'Please end your active break before clocking out.');
  }

  const outTime = new Date();
  const { totalHours, overtimeHours } = calculateAttendanceMetrics(log.clockIn, outTime, log.breaks, employee.shift);

  log.clockOut = outTime;
  log.totalHours = totalHours;
  log.overtimeHours = overtimeHours;
  await log.save();

  res.send(new ApiResponse(200, { attendance: log }, 'Clocked out successfully'));
});

const startBreak = catchAsync(async (req, res) => {
  const employee = await findEmployeeForUser(req.user._id);
  const dateStr = getLocalDateString();

  let log = await attendanceRepo.findTodayRecord(employee._id, dateStr);
  if (!log) {
    throw new ApiError(400, 'No clock-in record found for today.');
  }
  if (log.clockOut) {
    throw new ApiError(400, 'Already clocked out for today.');
  }

  const activeBreak = log.breaks.find(b => b.end === null);
  if (activeBreak) {
    throw new ApiError(400, 'You are already on break.');
  }

  log.breaks.push({ start: new Date() });
  await log.save();

  res.send(new ApiResponse(200, { attendance: log }, 'Break started'));
});

const endBreak = catchAsync(async (req, res) => {
  const employee = await findEmployeeForUser(req.user._id);
  const dateStr = getLocalDateString();

  let log = await attendanceRepo.findTodayRecord(employee._id, dateStr);
  if (!log) {
    throw new ApiError(400, 'No clock-in record found for today.');
  }
  if (log.clockOut) {
    throw new ApiError(400, 'Already clocked out for today.');
  }

  const activeBreakIndex = log.breaks.findIndex(b => b.end === null);
  if (activeBreakIndex === -1) {
    throw new ApiError(400, 'No active break found to end.');
  }

  log.breaks[activeBreakIndex].end = new Date();
  await log.save();

  res.send(new ApiResponse(200, { attendance: log }, 'Break ended'));
});

const getMyLogs = catchAsync(async (req, res) => {
  const employee = await Employee.findOne({ userId: req.user._id, isDeleted: false });
  if (!employee) {
    return res.send(new ApiResponse(200, { items: [], total: 0, page: 1, limit: 30, totalPages: 0 }, 'No employee profile linked'));
  }
  const { page, limit } = req.query;
  const result = await attendanceRepo.getEmployeeAttendanceLogs(employee._id, {
    page: parseInt(page, 10) || 1,
    limit: parseInt(limit, 10) || 30,
  });
 
  res.send(new ApiResponse(200, result, 'Attendance history retrieved'));
});

const getRosterList = catchAsync(async (req, res) => {
  const dateStr = req.query.date || getLocalDateString();
  const roster = await attendanceRepo.getDailyRoster(dateStr);
  res.send(new ApiResponse(200, { date: dateStr, roster }, 'Daily attendance roster retrieved'));
});

const logManualAttendance = catchAsync(async (req, res) => {
  const { employeeId, date, clockIn, clockOut, status, breaks, remarks } = req.body;

  let existing = await Attendance.findOne({ employeeId, date });
  if (existing) {
    throw new ApiError(400, 'Attendance record already exists for this employee on this date.');
  }

  const employee = await Employee.findById(employeeId);
  if (!employee) throw new ApiError(404, 'Employee record not found');

  const metrics = calculateAttendanceMetrics(clockIn, clockOut, breaks, employee.shift);

  const log = await attendanceRepo.createRecord({
    employeeId,
    date,
    clockIn,
    clockOut: clockOut || null,
    status: status || 'present',
    breaks: breaks || [],
    totalHours: clockOut ? metrics.totalHours : 0,
    overtimeHours: clockOut ? metrics.overtimeHours : 0,
    remarks: remarks || '',
  });

  res.status(201).send(new ApiResponse(201, { attendance: log }, 'Manual attendance logged'));
});

const updateAttendanceLog = catchAsync(async (req, res) => {
  const log = await Attendance.findById(req.params.id);
  if (!log) throw new ApiError(404, 'Attendance log not found');

  const employee = await Employee.findById(log.employeeId);
  if (!employee) throw new ApiError(404, 'Employee record not found');

  const { clockIn, clockOut, status, breaks, remarks } = req.body;

  if (clockIn) log.clockIn = clockIn;
  if (clockOut !== undefined) log.clockOut = clockOut;
  if (status) log.status = status;
  if (breaks) log.breaks = breaks;
  if (remarks !== undefined) log.remarks = remarks;

  if (log.clockIn && log.clockOut) {
    const metrics = calculateAttendanceMetrics(log.clockIn, log.clockOut, log.breaks, employee.shift);
    log.totalHours = metrics.totalHours;
    log.overtimeHours = metrics.overtimeHours;
  } else {
    log.totalHours = 0;
    log.overtimeHours = 0;
  }

  await log.save();
  res.send(new ApiResponse(200, { attendance: log }, 'Attendance log adjusted successfully'));
});

// Import model reference to resolve inline schema definitions for logManualAttendance and updateAttendanceLog
const Attendance = require('../models/Attendance.model');

module.exports = {
  getTodayStatus,
  clockIn,
  clockOut,
  startBreak,
  endBreak,
  getMyLogs,
  getRosterList,
  logManualAttendance,
  updateAttendanceLog,
};
