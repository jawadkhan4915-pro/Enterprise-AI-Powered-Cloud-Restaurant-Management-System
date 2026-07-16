const express = require('express');
const auth = require('../../middlewares/auth.middleware');
const { checkPermission } = require('../../middlewares/rbac.middleware');
const ctrl = require('../../controllers/employees.controller');

const router = express.Router();
router.use(auth);

router.route('/')
  .get(ctrl.getEmployeesList)
  .post(checkPermission('manage_employees'), ctrl.onboardEmployee);

router.route('/:id')
  .patch(checkPermission('manage_employees'), ctrl.updateEmployeeProfile)
  .delete(checkPermission('manage_employees'), ctrl.terminateEmployee);

module.exports = router;
