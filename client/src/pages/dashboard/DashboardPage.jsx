import React from 'react';
import useAuth from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

export const DashboardPage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 p-8 transition-colors duration-200">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">
              Dashboard
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Welcome back to your RestaurantOS control panel.
            </p>
          </div>
          <Button variant="outline" onClick={logout}>
            Sign out
          </Button>
        </div>

        <Card className="flex flex-col space-y-4">
          <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h2 className="text-base font-semibold text-slate-800 dark:text-zinc-200">
              Active User Credentials (Phase 1 Status)
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-400 block text-xs">Name</span>
              <span className="font-medium text-slate-800 dark:text-zinc-300">{user?.name}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-xs">Email</span>
              <span className="font-medium text-slate-800 dark:text-zinc-300">{user?.email}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-xs">Role</span>
              <span className="font-medium text-slate-800 dark:text-zinc-300 uppercase">{user?.role}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-xs">Email Verified</span>
              <span className={`font-semibold ${user?.isEmailVerified ? 'text-emerald-500' : 'text-amber-500'}`}>
                {user?.isEmailVerified ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
