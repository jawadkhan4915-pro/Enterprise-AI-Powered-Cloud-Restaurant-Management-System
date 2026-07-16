const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const reservationsRepo = require('../repositories/reservations.repository');
const restaurantRepo = require('../repositories/restaurant.repository');
const ApiError = require('../utils/ApiError');

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

  res.send(new ApiResponse(200, { reservation }, `Reservation status updated to ${status}`));
});

module.exports = {
  getReservationsList,
  createBooking,
  updateBookingStatus,
};
