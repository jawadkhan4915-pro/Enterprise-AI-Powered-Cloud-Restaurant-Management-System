const express = require('express');
const auth = require('../../middlewares/auth.middleware');
const { checkPermission } = require('../../middlewares/rbac.middleware');
const ctrl = require('../../controllers/attendance.controller');

const router = express.Router();

// All attendance actions require authentication
router.use(auth);

// Personal attendance routes
router.get('/today', ctrl.getTodayStatus);
router.post('/clock-in', ctrl.clockIn);
router.post('/clock-out', ctrl.clockOut);
router.post('/break/start', ctrl.startBreak);
router.post('/break/end', ctrl.endBreak);
router.get('/history', ctrl.getMyLogs);

// Managerial roster and adjustments
router.get('/roster', checkPermission('read_employees'), ctrl.getRosterList);
router.post('/log', checkPermission('manage_employees'), ctrl.logManualAttendance);
router.patch('/log/:id', checkPermission('manage_employees'), ctrl.updateAttendanceLog);

module.exports = router;
