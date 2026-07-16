const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const menuRepository = require('../repositories/menu.repository');
const restaurantRepository = require('../repositories/restaurant.repository');
const ApiError = require('../utils/ApiError');
const slugify = (text) => text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

// Categories
const getCategories = catchAsync(async (req, res) => {
  const categories = await menuRepository.getCategories(req.query);
  res.send(new ApiResponse(200, { categories }, 'Categories list retrieved'));
});

const createCategory = catchAsync(async (req, res) => {
  let profile = await restaurantRepository.getProfile();
  if (!profile) {
    profile = await restaurantRepository.updateProfile({ name: 'RestaurantOS AI HQ' });
  }

  const slug = slugify(req.body.name);
  const categoryData = {
    ...req.body,
    slug,
    restaurantId: profile._id,
  };
  const category = await menuRepository.createCategory(categoryData);
  res.status(201).send(new ApiResponse(201, { category }, 'Category created successfully'));
});

const updateCategory = catchAsync(async (req, res) => {
  if (req.body.name) {
    req.body.slug = slugify(req.body.name);
  }
  const category = await menuRepository.updateCategory(req.params.id, req.body);
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }
  res.send(new ApiResponse(200, { category }, 'Category details updated'));
});

const deleteCategory = catchAsync(async (req, res) => {
  const category = await menuRepository.deleteCategory(req.params.id);
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }
  res.send(new ApiResponse(200, null, 'Category soft deleted successfully'));
});

// Menu Items
const getMenuItemsList = catchAsync(async (req, res) => {
  const { search, categoryId, page, limit } = req.query;
  const filters = { search, categoryId };
  const options = { 
    page: parseInt(page, 10) || 1, 
    limit: parseInt(limit, 10) || 12 
  };
  
  const result = await menuRepository.getMenuItems(filters, options);
  res.send(new ApiResponse(200, result, 'Menu items retrieved successfully'));
});

const getMenuItemDetail = catchAsync(async (req, res) => {
  const item = await menuRepository.getMenuItemById(req.params.id);
  if (!item) {
    throw new ApiError(404, 'Menu item not found');
  }
  res.send(new ApiResponse(200, { item }, 'Menu item details retrieved'));
});

const createMenuItem = catchAsync(async (req, res) => {
  let profile = await restaurantRepository.getProfile();
  if (!profile) {
    profile = await restaurantRepository.updateProfile({ name: 'RestaurantOS AI HQ' });
  }

  // Handle local file photo upload path
  let imageUrl = '';
  if (req.file) {
    imageUrl = `/uploads/${req.file.filename}`;
  }

  // Convert potential string JSON variables to actual objects (when multipart forms send variants/addOns as JSON string)
  let variants = [];
  let addOns = [];
  let nutritionalInfo = {};
  let allergyInfo = [];

  if (req.body.variants) {
    variants = typeof req.body.variants === 'string' ? JSON.parse(req.body.variants) : req.body.variants;
  }
  if (req.body.addOns) {
    addOns = typeof req.body.addOns === 'string' ? JSON.parse(req.body.addOns) : req.body.addOns;
  }
  if (req.body.nutritionalInfo) {
    nutritionalInfo = typeof req.body.nutritionalInfo === 'string' ? JSON.parse(req.body.nutritionalInfo) : req.body.nutritionalInfo;
  }
  if (req.body.allergyInfo) {
    allergyInfo = typeof req.body.allergyInfo === 'string' ? JSON.parse(req.body.allergyInfo) : req.body.allergyInfo;
  }

  const itemData = {
    ...req.body,
    image: imageUrl,
    variants,
    addOns,
    nutritionalInfo,
    allergyInfo,
    restaurantId: profile._id,
  };

  const item = await menuRepository.createMenuItem(itemData);
  res.status(201).send(new ApiResponse(201, { item }, 'Menu item created successfully'));
});

const updateMenuItem = catchAsync(async (req, res) => {
  const existingItem = await menuRepository.getMenuItemById(req.params.id);
  if (!existingItem) {
    throw new ApiError(404, 'Menu item not found');
  }

  let updateBody = { ...req.body };

  // Update photo if new file attached
  if (req.file) {
    updateBody.image = `/uploads/${req.file.filename}`;
  }

  // Handle potential string JSON arrays inside multipart data
  if (updateBody.variants) {
    updateBody.variants = typeof updateBody.variants === 'string' ? JSON.parse(updateBody.variants) : updateBody.variants;
  }
  if (updateBody.addOns) {
    updateBody.addOns = typeof updateBody.addOns === 'string' ? JSON.parse(updateBody.addOns) : updateBody.addOns;
  }
  if (updateBody.nutritionalInfo) {
    updateBody.nutritionalInfo = typeof updateBody.nutritionalInfo === 'string' ? JSON.parse(updateBody.nutritionalInfo) : updateBody.nutritionalInfo;
  }
  if (updateBody.allergyInfo) {
    updateBody.allergyInfo = typeof updateBody.allergyInfo === 'string' ? JSON.parse(updateBody.allergyInfo) : updateBody.allergyInfo;
  }

  const item = await menuRepository.updateMenuItem(req.params.id, updateBody);
  res.send(new ApiResponse(200, { item }, 'Menu item details updated'));
});

const deleteMenuItem = catchAsync(async (req, res) => {
  const item = await menuRepository.deleteMenuItem(req.params.id);
  if (!item) {
    throw new ApiError(404, 'Menu item not found');
  }
  res.send(new ApiResponse(200, null, 'Menu item soft deleted successfully'));
});

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getMenuItemsList,
  getMenuItemDetail,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
};
