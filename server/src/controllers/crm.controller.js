const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const crmRepo = require('../repositories/crm.repository');
const ApiError = require('../utils/ApiError');

const getCustomersList = catchAsync(async (req, res) => {
  const { search, page, limit } = req.query;
  const filters = { search };
  const options = {
    page: parseInt(page, 10) || 1,
    limit: parseInt(limit, 10) || 20,
  };

  const result = await crmRepo.getCustomers(filters, options);
  res.send(new ApiResponse(200, result, 'Customers list retrieved'));
});

const createCustomerProfile = catchAsync(async (req, res) => {
  const customer = await crmRepo.createCustomer(req.body);
  res.status(201).send(new ApiResponse(201, { customer }, 'Customer profile created successfully'));
});

const getCustomerDetail = catchAsync(async (req, res) => {
  const customer = await crmRepo.getCustomerById(req.params.id);
  if (!customer) throw new ApiError(404, 'Customer not found');
  res.send(new ApiResponse(200, { customer }, 'Customer details retrieved'));
});

const updateCustomerProfile = catchAsync(async (req, res) => {
  const customer = await crmRepo.updateCustomer(req.params.id, req.body);
  if (!customer) throw new ApiError(404, 'Customer not found');
  res.send(new ApiResponse(200, { customer }, 'Customer profile updated'));
});

module.exports = {
  getCustomersList,
  createCustomerProfile,
  getCustomerDetail,
  updateCustomerProfile,
};
