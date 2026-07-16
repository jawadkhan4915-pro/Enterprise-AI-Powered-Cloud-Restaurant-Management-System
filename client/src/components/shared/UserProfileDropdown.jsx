import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import Card from '../ui/Card';

export const UserProfileDropdown = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogout = async () => {
    onClose();
    await logout();
    navigate('/login');
  };

  const handleNavigate = (path) => {
    onClose();
    navigate(path);
  };

  const getRoleLabel = (role) => {
    return role ? role.replace('_', ' ').toUpperCase() : 'STAFF';
  };

  return (
    <>
      {/* Click-away overlay */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Profile menu */}
      <Card className="absolute right-0 mt-2.5 w-56 p-2 z-50 animate-scale-in border border-slate-100 dark:border-zinc-900 shadow-premium bg-white dark:bg-zinc-950">
        {/* User Card */}
        <div className="px-3 py-2.5 border-b border-slate-100 dark:border-zinc-900 mb-2">
          <p className="text-xs font-bold text-slate-800 dark:text-zinc-100 truncate">{user?.name}</p>
          <p className="text-[10px] text-slate-400 dark:text-zinc-500 truncate">{user?.email}</p>
          <span className="inline-block text-[9px] bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400 font-bold px-1.5 py-0.5 rounded-pill mt-1.5">
            {getRoleLabel(user?.role)}
          </span>
        </div>

        {/* Buttons List */}
        <div className="space-y-0.5">
          <button
            onClick={() => handleNavigate('/profile')}
            className="flex items-center w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-input transition-colors dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
          >
            <User className="h-4 w-4 mr-2.5 text-slate-400" />
            My Profile
          </button>
          <button
            onClick={() => handleNavigate('/settings')}
            className="flex items-center w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-input transition-colors dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
          >
            <Settings className="h-4 w-4 mr-2.5 text-slate-400" />
            Account Settings
          </button>
          
          <div className="border-t border-slate-100 dark:border-zinc-900 my-1.5" />

          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 rounded-input transition-colors dark:hover:bg-red-950/20 dark:hover:text-red-500"
          >
            <LogOut className="h-4 w-4 mr-2.5 text-red-400" />
            Log Out
          </button>
        </div>
      </Card>
    </>
  );
};

export default UserProfileDropdown;
