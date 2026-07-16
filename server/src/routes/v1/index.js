const express = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const restaurantRoutes = require('./restaurant.routes');
const menuRoutes = require('./menu.routes');
const orderRoutes = require('./order.routes');
const inventoryRoutes = require('./inventory.routes');
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

module.exports = router;
