const Customer = require('../models/Customer.model');

const getCustomers = async (filters = {}, options = {}) => {
  const { search } = filters;
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  const query = { isDeleted: false };
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }

  const items = await Customer.find(query)
    .sort({ name: 1 })
    .skip(skip)
    .limit(limit);

  const total = await Customer.countDocuments(query);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

const getCustomerById = async (id) => {
  return Customer.findOne({ _id: id, isDeleted: false });
};

const createCustomer = async (data) => {
  return Customer.create(data);
};

const updateCustomer = async (id, data) => {
  return Customer.findOneAndUpdate({ _id: id, isDeleted: false }, data, { new: true });
};

const incrementLoyaltyPoints = async (id, points, spentAmount) => {
  return Customer.findOneAndUpdate(
    { _id: id, isDeleted: false },
    {
      $inc: {
        loyaltyPoints: points,
        visitCount: 1,
        totalSpent: spentAmount,
      },
    },
    { new: true }
  );
};

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  incrementLoyaltyPoints,
};
