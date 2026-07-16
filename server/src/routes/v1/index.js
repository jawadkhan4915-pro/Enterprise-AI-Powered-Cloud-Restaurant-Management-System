const express = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const ApiResponse = require('../../utils/ApiResponse');

const router = express.Router();

// Health Check API
router.get('/health', (req, res) => {
  res.send(new ApiResponse(200, { status: 'OK', timestamp: new Date() }, 'API server is running smoothly'));
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);

module.exports = router;
