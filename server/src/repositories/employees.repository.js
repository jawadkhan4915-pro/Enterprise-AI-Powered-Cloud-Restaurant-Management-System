const Employee = require('../models/Employee.model');

const getEmployees = async (filters = {}, options = {}) => {
  const { search, role, status } = filters;
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  const query = { isDeleted: false };
  if (role) query.role = role;
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const items = await Employee.find(query)
    .populate('userId', 'name email role')
    .sort({ hireDate: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Employee.countDocuments(query);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

const createEmployee = async (data) => {
  return Employee.create(data);
};

const updateEmployee = async (id, data) => {
  return Employee.findOneAndUpdate({ _id: id, isDeleted: false }, data, { new: true });
};

const deleteEmployee = async (id) => {
  return Employee.findOneAndUpdate({ _id: id }, { isDeleted: true }, { new: true });
};

module.exports = {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
