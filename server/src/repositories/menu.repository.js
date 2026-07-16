const Category = require('../models/Category.model');
const MenuItem = require('../models/MenuItem.model');

// Category CRUD
const getCategories = async (query = {}) => {
  return Category.find({ ...query, isDeleted: false }).sort({ order: 1 });
};

const createCategory = async (categoryBody) => {
  return Category.create(categoryBody);
};

const updateCategory = async (id, updateBody) => {
  return Category.findOneAndUpdate({ _id: id, isDeleted: false }, updateBody, { new: true });
};

const deleteCategory = async (id) => {
  // Soft delete category and recursively delete/deactivate subcategories
  await Category.updateMany({ parentId: id }, { isDeleted: true });
  return Category.findOneAndUpdate({ _id: id }, { isDeleted: true }, { new: true });
};

// Menu Items CRUD
const getMenuItems = async (filters = {}, options = {}) => {
  const { search, categoryId } = filters;
  const { page = 1, limit = 12 } = options;
  const skip = (page - 1) * limit;

  const matchQuery = { isDeleted: false };
  if (categoryId) {
    matchQuery.categoryId = categoryId;
  }
  if (search) {
    matchQuery.name = { $regex: search, $options: 'i' };
  }

  const items = await MenuItem.find(matchQuery)
    .populate('categoryId', 'name')
    .sort({ name: 1 })
    .skip(skip)
    .limit(limit);

  const total = await MenuItem.countDocuments(matchQuery);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

const getMenuItemById = async (id) => {
  return MenuItem.findOne({ _id: id, isDeleted: false }).populate('categoryId', 'name');
};

const createMenuItem = async (itemBody) => {
  return MenuItem.create(itemBody);
};

const updateMenuItem = async (id, updateBody) => {
  return MenuItem.findOneAndUpdate({ _id: id, isDeleted: false }, updateBody, { new: true });
};

const deleteMenuItem = async (id) => {
  return MenuItem.findOneAndUpdate({ _id: id }, { isDeleted: true }, { new: true });
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
};
