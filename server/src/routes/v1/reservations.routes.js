const express = require('express');
const auth = require('../../middlewares/auth.middleware');
const { checkPermission } = require('../../middlewares/rbac.middleware');
const ctrl = require('../../controllers/reservations.controller');

const router = express.Router();
router.use(auth);

router.route('/')
  .get(ctrl.getReservationsList)
  .post(checkPermission('create_orders'), ctrl.createBooking);

router.route('/:id/status')
  .patch(checkPermission('update_orders'), ctrl.updateBookingStatus);

module.exports = router;
