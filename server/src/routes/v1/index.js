const express = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const restaurantRoutes = require('./restaurant.routes');
const menuRoutes = require('./menu.routes');
const orderRoutes = require('./order.routes');
const inventoryRoutes = require('./inventory.routes');
const crmRoutes = require('./crm.routes');
const reservationsRoutes = require('./reservations.routes');
const employeesRoutes = require('./employees.routes');
const financeRoutes = require('./finance.routes');
const reportsRoutes = require('./reports.routes');
const aiRoutes = require('./ai.routes');
const notificationRoutes = require('./notification.routes');
const ApiResponse = require('../../utils/ApiResponse');

const router = express.Router();

// Health Check API
router.get('/health', (req, res) => {
  res.send(new ApiResponse(200, { status: 'OK', timestamp: new Date() }, 'API server is running smoothly'));
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/restaurant', restaurantRoutes);
router.use('/menu', menuRoutes);
router.use('/orders', orderRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/crm', crmRoutes);
router.use('/reservations', reservationsRoutes);
router.use('/employees', employeesRoutes);
router.use('/finance', financeRoutes);
router.use('/reports', reportsRoutes);
router.use('/ai', aiRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;
