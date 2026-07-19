const Attendance = require('../models/Attendance.model');
const Employee = require('../models/Employee.model');

const findTodayRecord = async (employeeId, dateStr) => {
  return Attendance.findOne({ employeeId, date: dateStr });
};

const createRecord = async (data) => {
  return Attendance.create(data);
};

const updateRecord = async (id, data) => {
  return Attendance.findByIdAndUpdate(id, data, { new: true });
};

const getEmployeeAttendanceLogs = async (employeeId, options = {}) => {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  const logs = await Attendance.find({ employeeId })
    .sort({ date: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Attendance.countDocuments({ employeeId });

  return {
    items: logs,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

const getAllAttendanceLogs = async (filters = {}, options = {}) => {
  const { date, employeeId, status } = filters;
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  const query = {};
  if (date) query.date = date;
  if (employeeId) query.employeeId = employeeId;
  if (status) query.status = status;

  const logs = await Attendance.find(query)
    .populate('employeeId', 'name email role shift')
    .sort({ date: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Attendance.countDocuments(query);

  return {
    items: logs,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

// Get the roster details for all active employees for a given date
const getDailyRoster = async (dateStr) => {
  // 1. Get all active employees
  const employees = await Employee.find({ isDeleted: false, status: 'active' })
    .select('name email role shift userId')
    .populate('userId', 'isActive');

  // 2. Get attendance logs for this day
  const logs = await Attendance.find({ date: dateStr });

  // 3. Map logs to employees
  const roster = employees.map((emp) => {
    const log = logs.find((l) => l.employeeId.toString() === emp._id.toString());
    return {
      employee: emp,
      attendance: log || null,
    };
  });

  return roster;
};

module.exports = {
  findTodayRecord,
  createRecord,
  updateRecord,
  getEmployeeAttendanceLogs,
  getAllAttendanceLogs,
  getDailyRoster,
};
