const Order = require('../models/Order.model');
const Expense = require('../models/Expense.model');
const InventoryItem = require('../models/InventoryItem.model');
const StockTransaction = require('../models/StockTransaction.model');
const Customer = require('../models/Customer.model');

/**
 * Sales summary: total revenue, average order value, order count breakdown by status
 */
const getSalesSummary = async ({ branchId, startDate, endDate }) => {
  const matchQuery = { isDeleted: false };
  if (branchId) matchQuery.branchId = branchId;
  if (startDate || endDate) {
    matchQuery.createdAt = {};
    if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
    if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
  }

  const [stats] = await Order.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$grandTotal', 0] } },
        totalOrders: { $sum: 1 },
        paidOrders: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] } },
        avgOrderValue: { $avg: '$grandTotal' },
      },
    },
  ]);

  // Revenue by date (last 30 days daily)
  const revenueByDay = await Order.aggregate([
    { $match: { ...matchQuery, paymentStatus: 'paid' } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$grandTotal' },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $limit: 30 },
  ]);

  return {
    totalRevenue: stats?.totalRevenue || 0,
    totalOrders: stats?.totalOrders || 0,
    paidOrders: stats?.paidOrders || 0,
    avgOrderValue: stats?.avgOrderValue || 0,
    revenueByDay,
  };
};

/**
 * Top selling menu items by quantity ordered
 */
const getTopSellingItems = async ({ branchId, startDate, endDate, limit = 10 }) => {
  const matchQuery = { paymentStatus: 'paid', isDeleted: false };
  if (branchId) matchQuery.branchId = branchId;
  if (startDate || endDate) {
    matchQuery.createdAt = {};
    if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
    if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
  }

  return Order.aggregate([
    { $match: matchQuery },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.menuItemId',
        name: { $first: '$items.name' },
        totalQuantity: { $sum: '$items.quantity' },
        totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
      },
    },
    { $sort: { totalQuantity: -1 } },
    { $limit: parseInt(limit) },
  ]);
};

/**
 * Expense breakdown by category
 */
const getExpenseBreakdown = async ({ branchId, startDate, endDate }) => {
  const matchQuery = { isDeleted: false };
  if (branchId) matchQuery.branchId = branchId;
  if (startDate || endDate) {
    matchQuery.date = {};
    if (startDate) matchQuery.date.$gte = new Date(startDate);
    if (endDate) matchQuery.date.$lte = new Date(endDate);
  }

  return Expense.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { total: -1 } },
  ]);
};

/**
 * Inventory stock value report
 */
const getInventoryValueReport = async ({ branchId }) => {
  const matchQuery = { isDeleted: false };
  if (branchId) matchQuery.branchId = branchId;

  const [stats] = await InventoryItem.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalItems: { $sum: 1 },
        totalStockValue: { $sum: { $multiply: ['$currentStock', '$costPerUnit'] } },
        lowStockCount: {
          $sum: {
            $cond: [{ $lte: ['$currentStock', '$minimumStock'] }, 1, 0],
          },
        },
      },
    },
  ]);

  const byCategory = await InventoryItem.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$category',
        itemCount: { $sum: 1 },
        stockValue: { $sum: { $multiply: ['$currentStock', '$costPerUnit'] } },
      },
    },
    { $sort: { stockValue: -1 } },
  ]);

  return {
    totalItems: stats?.totalItems || 0,
    totalStockValue: stats?.totalStockValue || 0,
    lowStockCount: stats?.lowStockCount || 0,
    byCategory,
  };
};

/**
 * Customer loyalty tier distribution
 */
const getCustomerStats = async () => {
  const tierBreakdown = await Customer.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: '$loyaltyTier',
        count: { $sum: 1 },
        totalPoints: { $sum: '$loyaltyPoints' },
        totalSpent: { $sum: '$totalSpent' },
      },
    },
    { $sort: { totalSpent: -1 } },
  ]);

  const [totals] = await Customer.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: null,
        totalCustomers: { $sum: 1 },
        totalVisits: { $sum: '$visitCount' },
        totalRevenue: { $sum: '$totalSpent' },
      },
    },
  ]);

  return {
    totalCustomers: totals?.totalCustomers || 0,
    totalVisits: totals?.totalVisits || 0,
    totalRevenue: totals?.totalRevenue || 0,
    tierBreakdown,
  };
};

module.exports = {
  getSalesSummary,
  getTopSellingItems,
  getExpenseBreakdown,
  getInventoryValueReport,
  getCustomerStats,
};
