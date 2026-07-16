import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { toggleSidebar, toggleTheme } from '../../redux/slices/ui.slice';
import useAuth from '../../hooks/useAuth';
import { Menu, Sun, Moon, Bell, ChevronRight, User } from 'lucide-react';
import NotificationPanel from './NotificationPanel';
import UserProfileDropdown from './UserProfileDropdown';

export const Topbar = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useAuth();
  const theme = useSelector((state) => state.ui.theme);
  
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Generate dynamic breadcrumbs from location pathname
  const getBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter((x) => x);
    if (pathnames.length === 0) return ['Dashboard'];
    
    return pathnames.map(
      (path) => path.charAt(0).toUpperCase() + path.slice(1).replace('-', ' ')
    );
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="sticky top-0 right-0 z-30 h-16 border-b border-slate-100 dark:border-zinc-900 glass-effect flex items-center justify-between px-6">
      {/* Sidebar toggle & Breadcrumbs */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="p-1.5 text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200 rounded-card hover:bg-slate-50 dark:hover:bg-zinc-900"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Breadcrumbs List */}
        <nav className="hidden md:flex items-center space-x-1.5 text-xs font-semibold text-slate-500 dark:text-zinc-400">
          <span className="hover:text-slate-800 dark:hover:text-zinc-200 cursor-pointer">RestaurantOS</span>
          <ChevronRight className="h-3 w-3 text-slate-300 dark:text-zinc-700" />
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb}>
              {idx > 0 && <ChevronRight className="h-3 w-3 text-slate-300 dark:text-zinc-700" />}
              <span className={`capitalize ${idx === breadcrumbs.length - 1 ? 'text-slate-800 dark:text-zinc-100 font-bold' : ''}`}>
                {crumb}
              </span>
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Action Controls */}
      <div className="flex items-center space-x-3.5">
        {/* Light/Dark Toggle */}
        <button
          onClick={() => dispatch(toggleTheme())}
          className="p-2 text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200 rounded-card hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors"
          title="Toggle color theme"
        >
          {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
        </button>

        {/* Notifications Icon dropdown trigger */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200 rounded-card hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors relative"
          >
            <Bell className="h-4.5 w-4.5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-primary rounded-full ring-2 ring-white dark:ring-zinc-950" />
          </button>

          <NotificationPanel 
            isOpen={notifOpen} 
            onClose={() => setNotifOpen(false)} 
          />
        </div>

        {/* User Info & Avatar dropdown trigger */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center space-x-2.5 p-1 rounded-pill hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors"
          >
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt="user avatar" 
                className="h-7 w-7 rounded-full object-cover border border-slate-200 dark:border-zinc-800" 
              />
            ) : (
              <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
              </div>
            )}
            <span className="hidden sm:inline text-xs font-bold text-slate-700 dark:text-zinc-300">
              {user?.name}
            </span>
          </button>

          <UserProfileDropdown 
            isOpen={profileOpen} 
            onClose={() => setProfileOpen(false)} 
          />
        </div>
      </div>
    </header>
  );
};

export default Topbar;
