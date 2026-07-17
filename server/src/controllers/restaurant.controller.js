const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const restaurantRepository = require('../repositories/restaurant.repository');
const ApiError = require('../utils/ApiError');
const Order = require('../models/Order.model');
const Table = require('../models/Table.model');
const InventoryItem = require('../models/InventoryItem.model');

// Restaurant Profile
const getRestaurantProfile = catchAsync(async (req, res) => {
  let profile = await restaurantRepository.getProfile();
  if (!profile) {
    profile = await restaurantRepository.updateProfile({ name: 'RestaurantOS AI HQ' });
  }
  res.send(new ApiResponse(200, { profile }, 'Profile retrieved successfully'));
});

const updateRestaurantProfile = catchAsync(async (req, res) => {
  const profile = await restaurantRepository.updateProfile(req.body);
  res.send(new ApiResponse(200, { profile }, 'Profile updated successfully'));
});

// Branches
const getRestaurantBranches = catchAsync(async (req, res) => {
  let profile = await restaurantRepository.getProfile();
  if (!profile) {
    profile = await restaurantRepository.updateProfile({ name: 'RestaurantOS AI HQ' });
  }
  const branches = await restaurantRepository.getBranches(profile._id);
  res.send(new ApiResponse(200, { branches }, 'Branches list retrieved'));
});

const createRestaurantBranch = catchAsync(async (req, res) => {
  let profile = await restaurantRepository.getProfile();
  if (!profile) {
    profile = await restaurantRepository.updateProfile({ name: 'RestaurantOS AI HQ' });
  }
  const branchData = {
    ...req.body,
    restaurantId: profile._id,
  };
  const branch = await restaurantRepository.createBranch(branchData);
  res.status(201).send(new ApiResponse(201, { branch }, 'Branch created successfully'));
});

const updateRestaurantBranch = catchAsync(async (req, res) => {
  const branch = await restaurantRepository.updateBranch(req.params.id, req.body);
  if (!branch) {
    throw new ApiError(404, 'Branch not found');
  }
  res.send(new ApiResponse(200, { branch }, 'Branch details updated'));
});

const deleteRestaurantBranch = catchAsync(async (req, res) => {
  const branch = await restaurantRepository.deleteBranch(req.params.id);
  if (!branch) {
    throw new ApiError(404, 'Branch not found');
  }
  res.send(new ApiResponse(200, null, 'Branch soft deleted successfully'));
});

// Floors
const getRestaurantFloors = catchAsync(async (req, res) => {
  const branchId = req.query.branchId;
  if (!branchId) {
    throw new ApiError(400, 'branchId query parameter is required');
  }
  const floors = await restaurantRepository.getFloors(branchId);
  res.send(new ApiResponse(200, { floors }, 'Floors list retrieved'));
});

const createRestaurantFloor = catchAsync(async (req, res) => {
  const floor = await restaurantRepository.createFloor(req.body);
  res.status(201).send(new ApiResponse(201, { floor }, 'Floor level added successfully'));
});

// Tables
const getFloorTables = catchAsync(async (req, res) => {
  const { floorId } = req.query;
  if (!floorId) {
    throw new ApiError(400, 'floorId query parameter is required');
  }
  const tables = await restaurantRepository.getTablesByFloor(floorId);
  res.send(new ApiResponse(200, { tables }, 'Floor tables list retrieved'));
});

const createFloorTable = catchAsync(async (req, res) => {
  const table = await restaurantRepository.createTable(req.body);
  res.status(201).send(new ApiResponse(201, { table }, 'Table layout node registered'));
});

const updateFloorTable = catchAsync(async (req, res) => {
  const table = await restaurantRepository.updateTable(req.params.id, req.body);
  if (!table) {
    throw new ApiError(404, 'Table layout not found');
  }
  res.send(new ApiResponse(200, { table }, 'Table node updated'));
});

const updateTableLayoutBatch = catchAsync(async (req, res) => {
  const { layout } = req.body;
  if (!layout || !Array.isArray(layout)) {
    throw new ApiError(400, 'layout array field is required in request body');
  }
  await restaurantRepository.batchUpdateTablePositions(layout);
  res.send(new ApiResponse(200, null, 'Layout batch coordinates updated successfully'));
});

const getDashboardStats = catchAsync(async (req, res) => {
  let profile = await restaurantRepository.getProfile();
  if (!profile) {
    profile = await restaurantRepository.updateProfile({ name: 'RestaurantOS AI HQ' });
  }
  const branches = await restaurantRepository.getBranches(profile._id);
  if (!branches.length) {
    return res.send(new ApiResponse(200, {
      todaySales: 0,
      occupiedTables: 0,
      totalTables: 0,
      kitchenOrders: 0,
      lowStockItems: 0
    }, 'Default stats'));
  }
  const branchId = branches[0]._id;

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const todayOrders = await Order.find({
    branchId,
    paymentStatus: 'paid',
    isDeleted: false,
    createdAt: { $gte: startOfToday, $lte: endOfToday }
  });

  const todaySales = todayOrders.reduce((acc, order) => acc + order.grandTotal, 0);

  const totalTables = await Table.countDocuments({ branchId, isDeleted: false });
  const occupiedTables = await Table.countDocuments({ branchId, status: 'occupied', isDeleted: false });

  const kitchenOrders = await Order.countDocuments({
    branchId,
    status: { $in: ['pending', 'preparing', 'ready'] },
    isDeleted: false
  });

  const allInventory = await InventoryItem.find({ branchId, isDeleted: false });
  const lowStockItems = allInventory.filter(item => item.currentStock <= item.minimumStock).length;

  res.send(new ApiResponse(200, {
    todaySales,
    occupiedTables,
    totalTables,
    kitchenOrders,
    lowStockItems
  }, 'Dashboard stats retrieved'));
});

module.exports = {
  getRestaurantProfile,
  updateRestaurantProfile,
  getRestaurantBranches,
  createRestaurantBranch,
  updateRestaurantBranch,
  deleteRestaurantBranch,
  getRestaurantFloors,
  createRestaurantFloor,
  getFloorTables,
  createFloorTable,
  updateFloorTable,
  updateTableLayoutBatch,
  getDashboardStats,
};
