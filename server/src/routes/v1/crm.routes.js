const express = require('express');
const auth = require('../../middlewares/auth.middleware');
const { checkPermission } = require('../../middlewares/rbac.middleware');
const ctrl = require('../../controllers/crm.controller');

const router = express.Router();
router.use(auth);

router.route('/')
  .get(ctrl.getCustomersList)
  .post(checkPermission('create_crm'), ctrl.createCustomerProfile);

router.route('/:id')
  .get(ctrl.getCustomerDetail)
  .patch(checkPermission('update_crm'), ctrl.updateCustomerProfile);

module.exports = router;
