import React from 'react';
import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toggleSidebar } from '../../redux/slices/ui.slice';
import usePermission from '../../hooks/usePermission';
import {
  LayoutDashboard,
  ShoppingCart,
  Receipt,
  ChefHat,
  MenuSquare,
  Package,
  Users,
  Calendar,
  Users2,
  DollarSign,
  BarChart3,
  Settings,
  X,
  Sparkles,
  HelpCircle
} from 'lucide-react';

export const Sidebar = () => {
  const dispatch = useDispatch();
  const sidebarOpen = useSelector((state) => state.ui.sidebarOpen);
  const { hasPermission, hasAnyPermission } = usePermission();

  const navigationItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, permission: 'read_auth' },
    { name: 'POS Touch', path: '/pos', icon: ShoppingCart, permission: ['manage_pos', 'create_orders'] },
    { name: 'Orders', path: '/orders', icon: Receipt, permission: 'read_orders' },
    { name: 'Kitchen Display', path: '/kitchen', icon: ChefHat, permission: 'manage_kitchen' },
    { name: 'Reservations', path: '/reservations', icon: Calendar, permission: 'read_tables' },
    { name: 'Menu Editor', path: '/menu', icon: MenuSquare, permission: 'update_menu' },
    { name: 'Inventory', path: '/inventory', icon: Package, permission: 'read_inventory' },
    { name: 'CRM & Loyalty', path: '/crm', icon: Users, permission: 'read_customers' },
    { name: 'Staff Management', path: '/employees', icon: Users2, permission: 'read_employees' },
    { name: 'Finance & P&L', path: '/finance', icon: DollarSign, permission: 'read_finance' },
    { name: 'Reports Builder', path: '/reports', icon: BarChart3, permission: 'read_reports' },
    { name: 'AI Assistant', path: '/ai', icon: Sparkles, permission: 'read_auth' },
    { name: 'Settings', path: '/settings', icon: Settings, permission: 'read_auth' },
    { name: 'Help Center', path: '/help', icon: HelpCircle, permission: 'read_auth' },
  ];

  // Filter items user has rights to see
  const visibleItems = navigationItems.filter(
    (item) => !item.permission || 
      (Array.isArray(item.permission) 
        ? hasAnyPermission(item.permission) 
        : hasPermission(item.permission))
  );

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          onClick={() => dispatch(toggleSidebar())}
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Main Sidebar */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-white border-r border-slate-100 dark:bg-zinc-950 dark:border-zinc-900 transition-transform duration-350 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header Brand */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-100 dark:border-zinc-900">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-primary/10 text-primary rounded-card">
              <ChefHat className="h-5 w-5" />
            </div>
            <span className="font-bold text-slate-800 dark:text-zinc-50 tracking-tight">RestaurantOS</span>
            <span className="text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded-pill">AI</span>
          </div>
          <button 
            onClick={() => dispatch(toggleSidebar())}
            className="p-1 text-slate-400 hover:text-slate-600 lg:hidden dark:hover:text-zinc-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {visibleItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-2.5 text-sm font-semibold rounded-input transition-all duration-150 group ${
                  isActive
                    ? 'bg-primary/10 text-primary dark:bg-primary/20'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50'
                }`
              }
            >
              <item.icon className="h-4.5 w-4.5 mr-3 shrink-0" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Footer Brand Info */}
        <div className="p-4 border-t border-slate-100 dark:border-zinc-900 text-center text-[10px] text-slate-400 dark:text-zinc-500 font-semibold">
          RestaurantOS v1.0.0 (Enterprise)
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
