const Expense = require('../models/Expense.model');
const Order = require('../models/Order.model');

const getExpenses = async (filters = {}, options = {}) => {
  const { branchId, category, status } = filters;
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  const query = { isDeleted: false };
  if (branchId) query.branchId = branchId;
  if (category) query.category = category;
  if (status) query.status = status;

  const items = await Expense.find(query)
    .populate('performedBy', 'name')
    .sort({ date: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Expense.countDocuments(query);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

const createExpense = async (data) => {
  return Expense.create(data);
};

const getFinanceSummary = async (branchId, dateRange = {}) => {
  const { start = new Date(new Date().setDate(new Date().getDate() - 30)), end = new Date() } = dateRange;

  const expenseQuery = {
    isDeleted: false,
    date: { $gte: start, $lte: end },
  };
  const revenueQuery = {
    isDeleted: false,
    paymentStatus: 'paid',
    createdAt: { $gte: start, $lte: end },
  };

  if (branchId) {
    expenseQuery.branchId = branchId;
    revenueQuery.branchId = branchId;
  }

  // Calculate sum of paid expenses
  const expensesList = await Expense.find(expenseQuery);
  const totalExpenses = expensesList.reduce((sum, item) => sum + item.amount, 0);

  // Calculate sum of completed orders
  const ordersList = await Order.find(revenueQuery);
  const totalRevenue = ordersList.reduce((sum, item) => sum + item.grandTotal, 0);

  return {
    totalRevenue,
    totalExpenses,
    netProfit: totalRevenue - totalExpenses,
    expensesCount: expensesList.length,
    revenueCount: ordersList.length,
  };
};

module.exports = {
  getExpenses,
  createExpense,
  getFinanceSummary,
};
