const express = require('express');
const auth = require('../../middlewares/auth.middleware');
const { checkPermission } = require('../../middlewares/rbac.middleware');
const ctrl = require('../../controllers/inventory.controller');

const router = express.Router();
router.use(auth);

// Alerts
router.get('/alerts', ctrl.getLowStockAlerts);

// Suppliers
router.route('/suppliers')
  .get(ctrl.getSuppliers)
  .post(checkPermission('create_inventory'), ctrl.createSupplier);

router.route('/suppliers/:id')
  .patch(checkPermission('update_inventory'), ctrl.updateSupplier)
  .delete(checkPermission('delete_inventory'), ctrl.deleteSupplier);

// Items
router.route('/items')
  .get(ctrl.getItems)
  .post(checkPermission('create_inventory'), ctrl.createItem);

router.route('/items/:id')
  .patch(checkPermission('update_inventory'), ctrl.updateItem)
  .delete(checkPermission('delete_inventory'), ctrl.deleteItem);

router.post('/items/:id/stock', checkPermission('update_inventory'), ctrl.adjustStock);

// Transactions
router.get('/transactions', ctrl.getTransactions);

module.exports = router;
