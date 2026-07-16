const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const orderRepository = require('../repositories/order.repository');
const restaurantRepository = require('../repositories/restaurant.repository');
const ApiError = require('../utils/ApiError');

const createOrder = catchAsync(async (req, res) => {
  // Retrieve active branch id if not supplied in body
  let { branchId } = req.body;
  if (!branchId) {
    const branches = await restaurantRepository.getBranches();
    if (branches.length > 0) {
      branchId = branches[0]._id;
    } else {
      throw new ApiError(400, 'Restaurant branch is not configured. Create a branch in settings first.');
    }
  }

  const orderData = {
    ...req.body,
    branchId,
  };

  const order = await orderRepository.createOrder(orderData);

  // Emit Socket.IO event for real-time KDS update
  const io = req.app.get('io');
  if (io) {
    io.emit('order_created', order);
  }

  res.status(201).send(new ApiResponse(201, { order }, 'Order ticket placed successfully'));
});

const getOrdersList = catchAsync(async (req, res) => {
  const { status, orderType, paymentStatus, search, page, limit } = req.query;
  const filters = { status, orderType, paymentStatus, search };
  const options = {
    page: parseInt(page, 10) || 1,
    limit: parseInt(limit, 10) || 20,
  };

  const result = await orderRepository.getOrders(filters, options);
  res.send(new ApiResponse(200, result, 'Orders list retrieved successfully'));
});

const getOrderDetail = catchAsync(async (req, res) => {
  const order = await orderRepository.getOrderById(req.params.id);
  if (!order) {
    throw new ApiError(404, 'Order ticket not found');
  }
  res.send(new ApiResponse(200, { order }, 'Order ticket details retrieved'));
});

const updateOrderStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  const order = await orderRepository.updateOrderStatus(req.params.id, status);
  if (!order) {
    throw new ApiError(404, 'Order ticket not found');
  }

  // Emit Socket.IO event to alert POS and KDS
  const io = req.app.get('io');
  if (io) {
    io.emit('order_updated', order);
  }

  res.send(new ApiResponse(200, { order }, `Order status updated to ${status}`));
});

const checkoutOrder = catchAsync(async (req, res) => {
  const order = await orderRepository.checkoutOrder(req.params.id, req.body);
  if (!order) {
    throw new ApiError(404, 'Order ticket not found');
  }

  // Emit Socket.IO events to reset table layout color styles on cash register checkout
  const io = req.app.get('io');
  if (io) {
    io.emit('order_updated', order);
    io.emit('table_status_sync');
  }

  res.send(new ApiResponse(200, { order }, 'Order paid and checked out successfully'));
});

module.exports = {
  createOrder,
  getOrdersList,
  getOrderDetail,
  updateOrderStatus,
  checkoutOrder,
};
