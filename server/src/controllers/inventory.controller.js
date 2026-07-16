const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const inventoryRepo = require('../repositories/inventory.repository');
const restaurantRepo = require('../repositories/restaurant.repository');

// Helper: resolve first branch
const getDefaultBranchId = async () => {
  const branches = await restaurantRepo.getBranches();
  if (!branches.length) throw new ApiError(400, 'No branch configured. Add a branch in Settings first.');
  return branches[0]._id;
};

// ─── Suppliers ────────────────────────────────────────────────────────────────
const getSuppliers = catchAsync(async (req, res) => {
  let profile = await restaurantRepo.getProfile();
  if (!profile) profile = await restaurantRepo.updateProfile({ name: 'RestaurantOS AI HQ' });
  const suppliers = await inventoryRepo.getSuppliers(profile._id);
  res.send(new ApiResponse(200, { suppliers }, 'Suppliers list retrieved'));
});

const createSupplier = catchAsync(async (req, res) => {
  let profile = await restaurantRepo.getProfile();
  if (!profile) profile = await restaurantRepo.updateProfile({ name: 'RestaurantOS AI HQ' });
  const supplier = await inventoryRepo.createSupplier({ ...req.body, restaurantId: profile._id });
  res.status(201).send(new ApiResponse(201, { supplier }, 'Supplier created'));
});

const updateSupplier = catchAsync(async (req, res) => {
  const supplier = await inventoryRepo.updateSupplier(req.params.id, req.body);
  if (!supplier) throw new ApiError(404, 'Supplier not found');
  res.send(new ApiResponse(200, { supplier }, 'Supplier updated'));
});

const deleteSupplier = catchAsync(async (req, res) => {
  await inventoryRepo.deleteSupplier(req.params.id);
  res.send(new ApiResponse(200, null, 'Supplier deleted'));
});

// ─── Items ────────────────────────────────────────────────────────────────────
const getItems = catchAsync(async (req, res) => {
  const { category, search, page, limit } = req.query;
  const branchId = req.query.branchId || await getDefaultBranchId();
  const result = await inventoryRepo.getItems(
    { branchId, category, search },
    { page: parseInt(page) || 1, limit: parseInt(limit) || 20 }
  );
  res.send(new ApiResponse(200, result, 'Inventory items retrieved'));
});

const createItem = catchAsync(async (req, res) => {
  const branchId = req.body.branchId || await getDefaultBranchId();
  const item = await inventoryRepo.createItem({ ...req.body, branchId });
  res.status(201).send(new ApiResponse(201, { item }, 'Inventory item created'));
});

const updateItem = catchAsync(async (req, res) => {
  const item = await inventoryRepo.updateItem(req.params.id, req.body);
  if (!item) throw new ApiError(404, 'Item not found');
  res.send(new ApiResponse(200, { item }, 'Item updated'));
});

const deleteItem = catchAsync(async (req, res) => {
  await inventoryRepo.deleteItem(req.params.id);
  res.send(new ApiResponse(200, null, 'Item deleted'));
});

// ─── Stock Adjustment ─────────────────────────────────────────────────────────
const adjustStock = catchAsync(async (req, res) => {
  const branchId = req.body.branchId || await getDefaultBranchId();
  const { type, quantity, notes } = req.body;

  const { item, tx } = await inventoryRepo.adjustStock({
    itemId: req.params.id,
    branchId,
    type,
    quantity: parseFloat(quantity),
    notes,
    performedBy: req.user?._id,
  });

  // Emit Socket.IO low-stock alert if threshold breached
  if (item.currentStock <= item.minimumStock) {
    const io = req.app.get('io');
    if (io) {
      io.emit('low_stock_alert', {
        itemId: item._id,
        name: item.name,
        currentStock: item.currentStock,
        minimumStock: item.minimumStock,
        unit: item.unit,
      });
    }
  }

  res.send(new ApiResponse(200, { item, transaction: tx }, 'Stock adjusted successfully'));
});

// ─── Transactions ─────────────────────────────────────────────────────────────
const getTransactions = catchAsync(async (req, res) => {
  const { itemId, type, page, limit } = req.query;
  const branchId = req.query.branchId || await getDefaultBranchId();
  const result = await inventoryRepo.getTransactions(
    { branchId, itemId, type },
    { page: parseInt(page) || 1, limit: parseInt(limit) || 30 }
  );
  res.send(new ApiResponse(200, result, 'Transactions history retrieved'));
});

// ─── Alerts ───────────────────────────────────────────────────────────────────
const getLowStockAlerts = catchAsync(async (req, res) => {
  const branchId = req.query.branchId || await getDefaultBranchId();
  const alerts = await inventoryRepo.getLowStockAlerts(branchId);
  res.send(new ApiResponse(200, { alerts }, 'Low-stock alerts retrieved'));
});

module.exports = {
  getSuppliers, createSupplier, updateSupplier, deleteSupplier,
  getItems, createItem, updateItem, deleteItem,
  adjustStock, getTransactions, getLowStockAlerts,
};
