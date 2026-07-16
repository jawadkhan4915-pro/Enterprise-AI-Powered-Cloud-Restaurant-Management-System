const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const financeRepo = require('../repositories/finance.repository');
const restaurantRepo = require('../repositories/restaurant.repository');
const ApiError = require('../utils/ApiError');

const getDefaultBranchId = async () => {
  const branches = await restaurantRepo.getBranches();
  if (!branches.length) throw new ApiError(400, 'No branch configured. Add a branch in Settings first.');
  return branches[0]._id;
};

const getExpensesList = catchAsync(async (req, res) => {
  const { category, status, page, limit } = req.query;
  const branchId = req.query.branchId || await getDefaultBranchId();

  const filters = { branchId, category, status };
  const options = {
    page: parseInt(page, 10) || 1,
    limit: parseInt(limit, 10) || 20,
  };

  const result = await financeRepo.getExpenses(filters, options);
  res.send(new ApiResponse(200, result, 'Expenses list retrieved'));
});

const logExpense = catchAsync(async (req, res) => {
  const branchId = req.body.branchId || await getDefaultBranchId();
  const expense = await financeRepo.createExpense({
    ...req.body,
    branchId,
    performedBy: req.user?._id,
  });
  res.status(201).send(new ApiResponse(201, { expense }, 'Expense logged successfully'));
});

const getBalanceSheetSummary = catchAsync(async (req, res) => {
  const branchId = req.query.branchId || await getDefaultBranchId();
  
  // Custom date ranges if provided
  const { startDate, endDate } = req.query;
  const dateRange = {};
  if (startDate) dateRange.start = new Date(startDate);
  if (endDate) dateRange.end = new Date(endDate);

  const summary = await financeRepo.getFinanceSummary(branchId, dateRange);
  res.send(new ApiResponse(200, { summary }, 'Finance summary balance sheet retrieved'));
});

module.exports = {
  getExpensesList,
  logExpense,
  getBalanceSheetSummary,
};
