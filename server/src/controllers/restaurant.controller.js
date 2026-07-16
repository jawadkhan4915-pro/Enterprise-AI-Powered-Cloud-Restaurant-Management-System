const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const restaurantRepository = require('../repositories/restaurant.repository');
const ApiError = require('../utils/ApiError');

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
};
