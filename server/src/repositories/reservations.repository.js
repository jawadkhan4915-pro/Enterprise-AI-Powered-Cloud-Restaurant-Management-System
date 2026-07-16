const Reservation = require('../models/Reservation.model');
const Table = require('../models/Table.model');

const getReservations = async (filters = {}, options = {}) => {
  const { branchId, status, date } = filters;
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  const query = { isDeleted: false };
  if (branchId) query.branchId = branchId;
  if (status) query.status = status;
  
  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    query.reservationTime = { $gte: startOfDay, $lte: endOfDay };
  }

  const items = await Reservation.find(query)
    .populate('customerId', 'name phone loyaltyTier')
    .populate('tableId', 'number capacity')
    .sort({ reservationTime: 1 })
    .skip(skip)
    .limit(limit);

  const total = await Reservation.countDocuments(query);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

const createReservation = async (data) => {
  const reservation = await Reservation.create(data);
  
  // If table is assigned, change table status to reserved
  if (reservation.tableId) {
    await Table.findByIdAndUpdate(reservation.tableId, { status: 'reserved' });
  }

  return reservation;
};

const updateReservationStatus = async (id, status) => {
  const reservation = await Reservation.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: { status } },
    { new: true }
  );

  // Sync Table status based on reservation state
  if (reservation && reservation.tableId) {
    if (status === 'seated') {
      await Table.findByIdAndUpdate(reservation.tableId, { status: 'occupied' });
    } else if (['cancelled', 'no_show'].includes(status)) {
      await Table.findByIdAndUpdate(reservation.tableId, { status: 'available' });
    }
  }

  return reservation;
};

const updateReservation = async (id, data) => {
  return Reservation.findOneAndUpdate({ _id: id, isDeleted: false }, data, { new: true });
};

module.exports = {
  getReservations,
  createReservation,
  updateReservationStatus,
  updateReservation,
};
