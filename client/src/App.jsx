import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser, setInitialized } from './redux/slices/auth.slice';
import ProtectedRoute from './components/guards/ProtectedRoute';
import GuestRoute from './components/guards/GuestRoute';
import ToastContainer from './components/ui/Toast';
import { getAccessToken } from './services/api';

// Lazy loading pages for route code-splitting
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('./pages/auth/VerifyEmailPage'));
const UnauthorizedPage = lazy(() => import('./pages/auth/UnauthorizedPage'));
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const POSPage = lazy(() => import('./pages/pos/POSPage'));
const OrdersPage = lazy(() => import('./pages/orders/OrdersPage'));
const KitchenPage = lazy(() => import('./pages/kitchen/KitchenPage'));
const ReservationsPage = lazy(() => import('./pages/reservations/ReservationsPage'));
const MenuPage = lazy(() => import('./pages/menu/MenuPage'));
const InventoryPage = lazy(() => import('./pages/inventory/InventoryPage'));
const CRMPage = lazy(() => import('./pages/crm/CRMPage'));
const EmployeesPage = lazy(() => import('./pages/employees/EmployeesPage'));
const FinancePage = lazy(() => import('./pages/finance/FinancePage'));
const ReportsPage = lazy(() => import('./pages/reports/ReportsPage'));
const AIPage = lazy(() => import('./pages/ai/AIPage'));
const SettingsPage = lazy(() => import('./pages/settings/SettingsPage'));
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const HelpCenterPage = lazy(() => import('./pages/help/HelpCenterPage'));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-zinc-950">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

export const App = () => {
  const dispatch = useDispatch();
  const { isInitialized } = useSelector((state) => state.auth);

  useEffect(() => {
    const initAuth = async () => {
      const token = getAccessToken();
      if (token) {
        await dispatch(fetchCurrentUser());
      } else {
        dispatch(setInitialized());
      }
    };
    initAuth();
  }, [dispatch]);

  if (!isInitialized) {
    return <PageLoader />;
  }

  return (
    <>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Guest Auth Routes */}
          <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
          <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
          <Route path="/reset-password" element={<GuestRoute><ResetPasswordPage /></GuestRoute>} />
          <Route path="/verify-email" element={<GuestRoute><VerifyEmailPage /></GuestRoute>} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/pos" element={<ProtectedRoute permission={['manage_pos', 'create_orders']}><POSPage /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
          <Route path="/kitchen" element={<ProtectedRoute><KitchenPage /></ProtectedRoute>} />
          <Route path="/reservations" element={<ProtectedRoute><ReservationsPage /></ProtectedRoute>} />
          <Route path="/menu" element={<ProtectedRoute permission="update_menu"><MenuPage /></ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute><InventoryPage /></ProtectedRoute>} />
          <Route path="/crm" element={<ProtectedRoute><CRMPage /></ProtectedRoute>} />
          <Route path="/employees" element={<ProtectedRoute><EmployeesPage /></ProtectedRoute>} />
          <Route path="/finance" element={<ProtectedRoute><FinancePage /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
          <Route path="/ai" element={<ProtectedRoute><AIPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/help" element={<ProtectedRoute><HelpCenterPage /></ProtectedRoute>} />

          {/* Fallback & Home Routes */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/" element={<LandingPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <ToastContainer />
    </>
  );
};

export default App;
