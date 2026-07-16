const InventoryItem = require('../models/InventoryItem.model');
const StockTransaction = require('../models/StockTransaction.model');
const Supplier = require('../models/Supplier.model');

// ─── Suppliers ────────────────────────────────────────────────────────────────
const getSuppliers = async (restaurantId) =>
  Supplier.find({ restaurantId, isDeleted: false }).sort({ name: 1 });

const createSupplier = async (data) => Supplier.create(data);

const updateSupplier = async (id, data) =>
  Supplier.findOneAndUpdate({ _id: id, isDeleted: false }, data, { new: true });

const deleteSupplier = async (id) =>
  Supplier.findOneAndUpdate({ _id: id }, { isDeleted: true }, { new: true });

// ─── Inventory Items ──────────────────────────────────────────────────────────
const getItems = async (filters = {}, options = {}) => {
  const { branchId, category, search } = filters;
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  const q = { isDeleted: false };
  if (branchId) q.branchId = branchId;
  if (category) q.category = category;
  if (search) q.name = { $regex: search, $options: 'i' };

  const items = await InventoryItem.find(q)
    .populate('supplierId', 'name')
    .sort({ name: 1 })
    .skip(skip)
    .limit(limit);

  const total = await InventoryItem.countDocuments(q);
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
};

const getItemById = async (id) =>
  InventoryItem.findOne({ _id: id, isDeleted: false }).populate('supplierId', 'name');

const createItem = async (data) => InventoryItem.create(data);

const updateItem = async (id, data) =>
  InventoryItem.findOneAndUpdate({ _id: id, isDeleted: false }, data, { new: true });

const deleteItem = async (id) =>
  InventoryItem.findOneAndUpdate({ _id: id }, { isDeleted: true }, { new: true });

// ─── Stock Adjustments ────────────────────────────────────────────────────────
const adjustStock = async ({ itemId, branchId, type, quantity, notes, performedBy }) => {
  const item = await InventoryItem.findById(itemId);
  if (!item) throw new Error('Inventory item not found');

  // Apply delta — purchases/adjustments can be + or -, consumption/waste always negative
  const delta = ['consumption', 'waste'].includes(type) ? -Math.abs(quantity) : quantity;
  item.currentStock = Math.max(0, item.currentStock + delta);
  await item.save();

  const tx = await StockTransaction.create({
    branchId,
    itemId,
    type,
    quantity: delta,
    notes,
    performedBy,
  });

  return { item, tx };
};

// ─── Transactions History ─────────────────────────────────────────────────────
const getTransactions = async (filters = {}, options = {}) => {
  const { branchId, itemId, type } = filters;
  const { page = 1, limit = 30 } = options;
  const skip = (page - 1) * limit;

  const q = {};
  if (branchId) q.branchId = branchId;
  if (itemId) q.itemId = itemId;
  if (type) q.type = type;

  const items = await StockTransaction.find(q)
    .populate('itemId', 'name unit')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await StockTransaction.countDocuments(q);
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
};

// ─── Low-Stock Alerts ─────────────────────────────────────────────────────────
const getLowStockAlerts = async (branchId) =>
  InventoryItem.find({
    branchId,
    isDeleted: false,
    $expr: { $lte: ['$currentStock', '$minimumStock'] },
  }).sort({ currentStock: 1 });

module.exports = {
  getSuppliers, createSupplier, updateSupplier, deleteSupplier,
  getItems, getItemById, createItem, updateItem, deleteItem,
  adjustStock, getTransactions, getLowStockAlerts,
};
