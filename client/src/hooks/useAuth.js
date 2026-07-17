import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, logoutUser, registerUser, clearError } from '../redux/slices/auth.slice';
import { addToast } from '../redux/slices/ui.slice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading, error, isInitialized } = useSelector((state) => state.auth);

  const handleLogin = useCallback(async (credentials) => {
    const resultAction = await dispatch(login(credentials));
    if (login.fulfilled.match(resultAction)) {
      dispatch(addToast({ message: 'Welcome back!', type: 'success' }));
      return resultAction.payload;
    } else {
      dispatch(addToast({ message: resultAction.payload || 'Login failed', type: 'error' }));
      return null;
    }
  }, [dispatch]);

  const handleRegister = useCallback(async (userData) => {
    const resultAction = await dispatch(registerUser(userData));
    if (registerUser.fulfilled.match(resultAction)) {
      dispatch(addToast({ message: 'Account registered! Verification code sent.', type: 'success' }));
      return true;
    } else {
      dispatch(addToast({ message: resultAction.payload || 'Registration failed', type: 'error' }));
      return false;
    }
  }, [dispatch]);

  const handleLogout = useCallback(async () => {
    await dispatch(logoutUser());
    dispatch(addToast({ message: 'Logged out successfully', type: 'info' }));
  }, [dispatch]);

  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    user,
    isAuthenticated,
    loading,
    error,
    isInitialized,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    clearError: handleClearError,
  };
};

export default useAuth;
