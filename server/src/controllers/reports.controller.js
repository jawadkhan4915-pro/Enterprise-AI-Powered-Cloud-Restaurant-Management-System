const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const reportsRepo = require('../repositories/reports.repository');
const restaurantRepo = require('../repositories/restaurant.repository');
const ApiError = require('../utils/ApiError');

const getDefaultBranchId = async () => {
  let profile = await restaurantRepo.getProfile();
  if (!profile) profile = await restaurantRepo.updateProfile({ name: 'RestaurantOS AI HQ' });
  const branches = await restaurantRepo.getBranches(profile._id);
  if (!branches.length) throw new ApiError(400, 'No branch configured. Add a branch in Settings first.');
  return branches[0]._id;
};

const getSalesSummary = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;
  const branchId = req.query.branchId || await getDefaultBranchId();
  const data = await reportsRepo.getSalesSummary({ branchId, startDate, endDate });
  res.send(new ApiResponse(200, data, 'Sales summary retrieved'));
});

const getTopSellingItems = catchAsync(async (req, res) => {
  const { startDate, endDate, limit } = req.query;
  const branchId = req.query.branchId || await getDefaultBranchId();
  const data = await reportsRepo.getTopSellingItems({ branchId, startDate, endDate, limit });
  res.send(new ApiResponse(200, { items: data }, 'Top selling items retrieved'));
});

const getExpenseBreakdown = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;
  const branchId = req.query.branchId || await getDefaultBranchId();
  const data = await reportsRepo.getExpenseBreakdown({ branchId, startDate, endDate });
  res.send(new ApiResponse(200, { breakdown: data }, 'Expense breakdown retrieved'));
});

const getInventoryValueReport = catchAsync(async (req, res) => {
  const branchId = req.query.branchId || await getDefaultBranchId();
  const data = await reportsRepo.getInventoryValueReport({ branchId });
  res.send(new ApiResponse(200, data, 'Inventory value report retrieved'));
});

const getCustomerStats = catchAsync(async (req, res) => {
  const data = await reportsRepo.getCustomerStats();
  res.send(new ApiResponse(200, data, 'Customer stats retrieved'));
});

module.exports = {
  getSalesSummary,
  getTopSellingItems,
  getExpenseBreakdown,
  getInventoryValueReport,
  getCustomerStats,
};
