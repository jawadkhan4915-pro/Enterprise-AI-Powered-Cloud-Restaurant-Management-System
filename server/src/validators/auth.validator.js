const { body } = require('express-validator');

const register = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Must be a valid email address').normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('role').optional().isIn([
    'super_admin', 'restaurant_owner', 'branch_manager', 'cashier', 
    'waiter', 'chef', 'kitchen_staff', 'inventory_manager', 
    'accountant', 'hr_manager', 'supplier', 'customer', 'delivery_rider'
  ]).withMessage('Invalid user role'),
];

const login = [
  body('email').isEmail().withMessage('Must be a valid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const forgotPassword = [
  body('email').isEmail().withMessage('Must be a valid email address').normalizeEmail(),
];

const resetPassword = [
  body('email').isEmail().withMessage('Must be a valid email address').normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be exactly 6 digits'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
];

const verifyEmail = [
  body('email').isEmail().withMessage('Must be a valid email address').normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be exactly 6 digits'),
];

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  verifyEmail,
};
