const express = require('express');
const auth = require('../../middlewares/auth.middleware');
const { checkPermission } = require('../../middlewares/rbac.middleware');
const orderController = require('../../controllers/order.controller');

const router = express.Router();

// Require authorization for all orders endpoints
router.use(auth);

router.route('/')
  .get(orderController.getOrdersList)
  .post(checkPermission('create_orders'), orderController.createOrder);

router.route('/:id')
  .get(orderController.getOrderDetail)
  .put(checkPermission('update_orders'), orderController.updateOrder);

router.route('/:id/status')
  .patch(checkPermission('update_orders'), orderController.updateOrderStatus);

router.route('/:id/checkout')
  .post(checkPermission('update_orders'), orderController.checkoutOrder);

module.exports = router;
