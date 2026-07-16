const express = require('express');
const auth = require('../../middlewares/auth.middleware');
const ctrl = require('../../controllers/reports.controller');

const router = express.Router();
router.use(auth);

router.get('/sales', ctrl.getSalesSummary);
router.get('/top-items', ctrl.getTopSellingItems);
router.get('/expenses', ctrl.getExpenseBreakdown);
router.get('/inventory', ctrl.getInventoryValueReport);
router.get('/customers', ctrl.getCustomerStats);

module.exports = router;
