import { useMemo, useCallback } from 'react';
import useAuth from './useAuth';

// Mimic the backend RBAC mapping for client-side routing and button displays
const ROLE_PERMISSIONS_FALLBACK = {
  super_admin: ['*'],
  restaurant_owner: ['*'],
  branch_manager: ['read_branch', 'update_branch', 'read_menu', 'create_menu', 'update_menu', 'delete_menu', 'read_orders', 'update_orders', 'read_inventory', 'update_inventory', 'read_employees', 'update_employees', 'read_finance', 'read_reports'],
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

export const usePermission = () => {
  const { user, isAuthenticated } = useAuth();

  const permissions = useMemo(() => {
    if (!isAuthenticated || !user) return [];
    
    // Super admin has all permissions
    if (user.role === 'super_admin') return ['*'];

    const rolePerms = ROLE_PERMISSIONS_FALLBACK[user.role] || [];
    const customPerms = user.customPermissions || [];
    
    // Union of role permissions and user custom overrides
    return Array.from(new Set([...rolePerms, ...customPerms]));
  }, [user, isAuthenticated]);

  const hasPermission = useCallback((permission) => {
    if (permissions.includes('*')) return true;
    return permissions.includes(permission);
  }, [permissions]);

  const hasAnyPermission = useCallback((perms = []) => {
    if (permissions.includes('*')) return true;
    return perms.some((p) => permissions.includes(p));
  }, [permissions]);

  const hasAllPermissions = useCallback((perms = []) => {
    if (permissions.includes('*')) return true;
    return perms.every((p) => permissions.includes(p));
  }, [permissions]);

  const hasRole = useCallback((roles = []) => {
    if (!user) return false;
    if (user.role === 'super_admin') return true;
    return roles.includes(user.role);
  }, [user]);

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
  };
};

export default usePermission;
