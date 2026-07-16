import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { removeToast } from '../../redux/slices/ui.slice';
import { AlertCircle, CheckCircle, Info, X, AlertTriangle } from 'lucide-react';

export const Toast = ({ id, message, type = 'info', duration = 3000 }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(removeToast(id));
    }, duration);
    return () => clearTimeout(timer);
  }, [id, duration, dispatch]);

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-emerald-500" />,
    error: <AlertCircle className="h-5 w-5 text-red-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
  };

  const bgStyles = {
    success: 'bg-white border-emerald-500/30 text-slate-800 dark:bg-zinc-900 dark:text-zinc-100 dark:border-emerald-500/20',
    error: 'bg-white border-red-500/30 text-slate-800 dark:bg-zinc-900 dark:text-zinc-100 dark:border-red-500/20',
    warning: 'bg-white border-amber-500/30 text-slate-800 dark:bg-zinc-900 dark:text-zinc-100 dark:border-amber-500/20',
    info: 'bg-white border-blue-500/30 text-slate-800 dark:bg-zinc-900 dark:text-zinc-100 dark:border-blue-500/20',
  };

  return (
    <div className={`flex items-center space-x-3 p-4 border rounded-card shadow-premium w-80 animate-fade-in glass-effect ${bgStyles[type]}`}>
      <div>{icons[type]}</div>
      <div className="flex-1 text-xs font-semibold">{message}</div>
      <button 
        onClick={() => dispatch(removeToast(id))}
        className="text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export const ToastContainer = () => {
  const toasts = useSelector((state) => state.ui.toasts);

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col space-y-3">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  );
};

export default ToastContainer;
