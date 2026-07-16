import React from 'react';
import { useSelector } from 'react-redux';
import Sidebar from '../components/shared/Sidebar';
import Topbar from '../components/shared/Topbar';

export const DashboardLayout = ({ children }) => {
  const sidebarOpen = useSelector((state) => state.ui.sidebarOpen);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 transition-colors duration-250 flex">
      {/* Navigation sidebar */}
      <Sidebar />

      {/* Main panel viewport content wrapper */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-350 ${
        sidebarOpen ? 'lg:pl-64' : 'lg:pl-0'
      }`}>
        {/* Navigation top bar */}
        <Topbar />

        {/* Viewport page container */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
