const express = require('express');
const auth = require('../../middlewares/auth.middleware');
const { checkPermission } = require('../../middlewares/rbac.middleware');
const ctrl = require('../../controllers/finance.controller');

const router = express.Router();
router.use(auth);

router.route('/expenses')
  .get(ctrl.getExpensesList)
  .post(checkPermission('manage_finance'), ctrl.logExpense);

router.route('/summary')
  .get(ctrl.getBalanceSheetSummary);

module.exports = router;
