import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

export const GuestRoute = ({ children }) => {
  const { isAuthenticated, isInitialized, user } = useAuth();
  const location = useLocation();

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-zinc-950">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    const getDefaultRouteForRole = (role) => {
      if (role === 'customer') return '/customer/order';
      if (role === 'delivery_rider') return '/rider/deliveries';
      if (role === 'chef' || role === 'kitchen_staff') return '/kitchen';
      if (role === 'cashier' || role === 'waiter') return '/pos';
      if (role === 'inventory_manager') return '/inventory';
      if (role === 'accountant') return '/finance';
      if (role === 'hr_manager') return '/employees';
      return '/dashboard';
    };

    const from = location.state?.from?.pathname;
    const redirectUrl = from && from !== '/login' && from !== '/'
      ? from
      : getDefaultRouteForRole(user?.role);

    return <Navigate to={redirectUrl} replace />;
  }

  return children;
};

export default GuestRoute;
