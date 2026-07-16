const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const employeesRepo = require('../repositories/employees.repository');
const ApiError = require('../utils/ApiError');

const getEmployeesList = catchAsync(async (req, res) => {
  const { search, role, status, page, limit } = req.query;
  const filters = { search, role, status };
  const options = {
    page: parseInt(page, 10) || 1,
    limit: parseInt(limit, 10) || 20,
  };

  const result = await employeesRepo.getEmployees(filters, options);
  res.send(new ApiResponse(200, result, 'Employees roster retrieved'));
});

const onboardEmployee = catchAsync(async (req, res) => {
  const employee = await employeesRepo.createEmployee(req.body);
  res.status(201).send(new ApiResponse(201, { employee }, 'Employee file added successfully'));
});

const updateEmployeeProfile = catchAsync(async (req, res) => {
  const employee = await employeesRepo.updateEmployee(req.params.id, req.body);
  if (!employee) throw new ApiError(404, 'Employee file not found');
  res.send(new ApiResponse(200, { employee }, 'Employee file updated'));
});

const terminateEmployee = catchAsync(async (req, res) => {
  const employee = await employeesRepo.deleteEmployee(req.params.id);
  if (!employee) throw new ApiError(404, 'Employee file not found');
  res.send(new ApiResponse(200, null, 'Employee profile soft deleted'));
});

module.exports = {
  getEmployeesList,
  onboardEmployee,
  updateEmployeeProfile,
  terminateEmployee,
};
