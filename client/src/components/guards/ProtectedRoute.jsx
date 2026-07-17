import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import usePermission from '../../hooks/usePermission';
import Skeleton from '../ui/Skeleton';

export const ProtectedRoute = ({ children, permission, roles }) => {
  const { isAuthenticated, loading, isInitialized } = useAuth();
  const { hasPermission, hasAnyPermission, hasRole } = usePermission();
  const location = useLocation();

  if (!isInitialized || (loading && !isAuthenticated)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-zinc-950 p-8 space-y-6">
        <div className="flex items-center space-x-2 animate-pulse">
          <div className="w-3 h-3 bg-primary rounded-full" />
          <div className="w-3 h-3 bg-primary rounded-full delay-75" />
          <div className="w-3 h-3 bg-primary rounded-full delay-150" />
        </div>
        <Skeleton variant="rectangular" width={280} height={40} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (permission) {
    const allowed = Array.isArray(permission) 
      ? hasAnyPermission(permission) 
      : hasPermission(permission);
    if (!allowed) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  if (roles && !hasRole(roles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
