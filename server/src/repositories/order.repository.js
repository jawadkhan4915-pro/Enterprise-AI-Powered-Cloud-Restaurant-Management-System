const Order = require('../models/Order.model');
const Table = require('../models/Table.model');

const generateOrderNumber = async () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const count = await Order.countDocuments({
    createdAt: {
      $gte: new Date(new Date().setHours(0, 0, 0, 0)),
      $lt: new Date(new Date().setHours(23, 59, 59, 999)),
    },
  });
  const seq = (count + 1).toString().padStart(4, '0');
  return `ORD-${dateStr}-${seq}`;
};

const createOrder = async (orderData) => {
  const orderNumber = await generateOrderNumber();
  const order = new Order({
    ...orderData,
    orderNumber,
  });
  await order.save();

  // If table is bound, update Table status to occupied
  if (order.tableId && order.orderType === 'dine_in') {
    await Table.findByIdAndUpdate(order.tableId, { status: 'occupied' });
  }

  return order;
};

const getOrders = async (filters = {}, options = {}) => {
  const { branchId, status, orderType, paymentStatus, search } = filters;
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  const matchQuery = { isDeleted: false };
  if (branchId) matchQuery.branchId = branchId;
  if (status) matchQuery.status = status;
  if (orderType) matchQuery.orderType = orderType;
  if (paymentStatus) matchQuery.paymentStatus = paymentStatus;
  
  if (search) {
    matchQuery.$or = [
      { orderNumber: { $regex: search, $options: 'i' } },
      { 'customerDetails.name': { $regex: search, $options: 'i' } },
    ];
  }

  const items = await Order.find(matchQuery)
    .populate('tableId', 'number')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Order.countDocuments(matchQuery);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

const getOrderById = async (id) => {
  return Order.findOne({ _id: id, isDeleted: false })
    .populate('tableId', 'number')
    .populate('branchId', 'name');
};

const updateOrderStatus = async (id, status) => {
  const updateData = { status };
  if (status === 'preparing') {
    updateData.preparingAt = new Date();
  } else if (status === 'ready') {
    updateData.readyAt = new Date();
  } else if (status === 'completed') {
    updateData.completedAt = new Date();
  }

  const order = await Order.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: updateData },
    { new: true }
  ).populate('tableId', 'number');

  return order;
};

const checkoutOrder = async (id, paymentDetails) => {
  const { paymentMethod, discountAmount } = paymentDetails;
  
  const order = await Order.findOne({ _id: id, isDeleted: false });
  if (!order) return null;

  order.paymentStatus = 'paid';
  order.paymentMethod = paymentMethod;
  order.status = 'completed';
  order.completedAt = new Date();
  
  if (discountAmount) {
    order.discount.amount = discountAmount;
    order.grandTotal = Math.max(0, order.grandTotal - discountAmount);
  }

  await order.save();

  // If table is bound, update Table status to dirty or available
  if (order.tableId) {
    // Mark as available so the table becomes green (free) in the reservations panel
    await Table.findByIdAndUpdate(order.tableId, { status: 'available' });
  }

  return order;
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  checkoutOrder,
};
