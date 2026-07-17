const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const reservationsRepo = require('../repositories/reservations.repository');
const restaurantRepo = require('../repositories/restaurant.repository');
const ApiError = require('../utils/ApiError');
const Customer = require('../models/Customer.model');
const logger = require('../config/logger');

const getDefaultBranchId = async () => {
  const branches = await restaurantRepo.getBranches();
  if (!branches.length) throw new ApiError(400, 'No branch configured. Add a branch in Settings first.');
  return branches[0]._id;
};

const getReservationsList = catchAsync(async (req, res) => {
  const { status, date, page, limit } = req.query;
  const branchId = req.query.branchId || await getDefaultBranchId();

  const filters = { branchId, status, date };
  const options = {
    page: parseInt(page, 10) || 1,
    limit: parseInt(limit, 10) || 20,
  };

  const result = await reservationsRepo.getReservations(filters, options);
  res.send(new ApiResponse(200, result, 'Reservations list retrieved'));
});

const createBooking = catchAsync(async (req, res) => {
  const branchId = req.body.branchId || await getDefaultBranchId();
  const reservation = await reservationsRepo.createReservation({
    ...req.body,
    branchId,
  });

  // Emit event to update floor planner live states
  const io = req.app.get('io');
  if (io) {
    io.emit('table_status_sync');
  }

  // Trigger notifications asynchronously
  (async () => {
    try {
      let email = '';
      const customerName = reservation.customerName;
      if (reservation.customerId) {
        const cust = await Customer.findById(reservation.customerId);
        if (cust && cust.email) email = cust.email;
      } else {
        const cust = await Customer.findOne({ phone: reservation.customerPhone, isDeleted: false });
        if (cust && cust.email) email = cust.email;
      }

      const branches = await restaurantRepo.getBranches();
      const branch = branches.find(b => b._id.toString() === branchId.toString());
      const branchName = branch ? branch.name : 'London Central';
      const timeStr = new Date(reservation.reservationTime).toLocaleString();

      // 1. Send confirmation email if email resolved
      if (email) {
        const emailService = require('../services/email.service');
        await emailService.sendReservationEmail(
          email,
          reservation,
          branchName,
          `Your reservation at ${branchName} is confirmed for ${reservation.partySize} guests on ${timeStr}.`,
          'booking_confirmed'
        );
      }

      // 2. Send SMS confirmation
      const smsService = require('../services/sms.service');
      const smsMsg = `Hello ${customerName}, your reservation at ${branchName} is confirmed for ${reservation.partySize} guests on ${timeStr}.`;
      await smsService.sendSMS(reservation.customerPhone, smsMsg, 'booking_confirmed');
    } catch (err) {
      logger.error('Failed to trigger reservation confirmation notifications:', err);
    }
  })();

  res.status(201).send(new ApiResponse(201, { reservation }, 'Reservation booked successfully'));
});

const updateBookingStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  const reservation = await reservationsRepo.updateReservationStatus(req.params.id, status);
  if (!reservation) throw new ApiError(404, 'Reservation not found');

  // Emit event to sync floor planner layout states
  const io = req.app.get('io');
  if (io) {
    io.emit('table_status_sync');
  }

  // Trigger notifications on seated or cancelled
  if (['seated', 'cancelled'].includes(status)) {
    (async () => {
      try {
        let email = '';
        if (reservation.customerId) {
          const cust = await Customer.findById(reservation.customerId);
          if (cust && cust.email) email = cust.email;
        } else {
          const cust = await Customer.findOne({ phone: reservation.customerPhone, isDeleted: false });
          if (cust && cust.email) email = cust.email;
        }

        const branches = await restaurantRepo.getBranches();
        const branch = branches.find(b => b._id.toString() === reservation.branchId.toString());
        const branchName = branch ? branch.name : 'London Central';

        let statusMsg = '';
        let type = '';
        if (status === 'seated') {
          statusMsg = `You have been seated at your table. Enjoy your meal!`;
          type = 'booking_seated';
        } else if (status === 'cancelled') {
          statusMsg = `Your reservation has been cancelled.`;
          type = 'booking_cancelled';
        }

        // 1. Send update email
        if (email) {
          const emailService = require('../services/email.service');
          await emailService.sendReservationEmail(email, reservation, branchName, statusMsg, type);
        }

        // 2. Send SMS alert
        const smsService = require('../services/sms.service');
        const smsMsg = `Hello ${reservation.customerName}, ${statusMsg}`;
        await smsService.sendSMS(reservation.customerPhone, smsMsg, type);
      } catch (err) {
        logger.error(`Failed to trigger reservation status ${status} notifications:`, err);
      }
    })();
  }

  res.send(new ApiResponse(200, { reservation }, `Reservation status updated to ${status}`));
});

module.exports = {
  getReservationsList,
  createBooking,
  updateBookingStatus,
};
