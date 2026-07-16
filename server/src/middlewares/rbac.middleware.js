const ApiError = require('../utils/ApiError');
const Role = require('../models/Role.model');

// Default predefined roles and permissions map in case DB is not populated or offline
const SYSTEM_ROLES_PERMISSIONS = {
  super_admin: ['*'], // wildcard access
  restaurant_owner: ['*'],
  branch_manager: ['read_branch', 'update_branch', 'read_menu', 'read_orders', 'update_orders', 'read_inventory', 'update_inventory', 'read_employees', 'update_employees', 'read_finance', 'read_reports'],
  cashier: ['read_menu', 'create_orders', 'read_orders', 'update_orders', 'manage_pos', 'read_customers', 'create_customers'],
  waiter: ['read_menu', 'create_orders', 'read_orders', 'update_orders', 'read_tables'],
  chef: ['read_orders', 'update_orders', 'manage_kitchen'],
  kitchen_staff: ['read_orders', 'update_orders'],
  inventory_manager: ['read_inventory', 'update_inventory', 'manage_suppliers', 'manage_purchases'],
  accountant: ['read_finance', 'manage_finance', 'read_reports'],
  hr_manager: ['manage_employees', 'read_employees'],
  supplier: ['read_orders'],
  customer: ['read_menu', 'create_orders', 'read_orders'],
  delivery_rider: ['read_orders', 'update_orders'],
};

/**
 * Check if the user has the required role
 * @param {Array<string>} roles 
 */
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Unauthorized'));
    }

    if (roles.includes(req.user.role) || req.user.role === 'super_admin') {
      return next();
    }

    return next(new ApiError(403, 'Forbidden: Insufficient role privileges'));
  };
};

/**
 * Check if the user has the required permission
 * @param {string} permission 
 */
const checkPermission = (permission) => {
  return async (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Unauthorized'));
    }

    const { role, customPermissions } = req.user;

    // Super Admin has absolute access
    if (role === 'super_admin') {
      return next();
    }

    // Check custom user override permissions first
    if (customPermissions && customPermissions.includes(permission)) {
      return next();
    }

    try {
      // Find role in DB to get permissions, fallback to system roles if not found
      const dbRole = await Role.findOne({ slug: role });
      const rolePermissions = dbRole ? dbRole.permissions : (SYSTEM_ROLES_PERMISSIONS[role] || []);

      if (rolePermissions.includes('*') || rolePermissions.includes(permission)) {
        return next();
      }

      return next(new ApiError(403, 'Forbidden: Insufficient resource permissions'));
    } catch (error) {
      return next(new ApiError(500, 'Internal permission check error'));
    }
  };
};

module.exports = {
  checkRole,
  checkPermission,
  SYSTEM_ROLES_PERMISSIONS,
};
