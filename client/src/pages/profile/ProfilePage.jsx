import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import useAuth from '../../hooks/useAuth';
import { User, Shield, Key } from 'lucide-react';

export const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-zinc-50">
            Account Profile
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage your personal profile settings and security keys.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card className="flex items-center space-x-6">
            <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl border border-primary/25 shadow-soft">
              {user?.name ? user.name.charAt(0).toUpperCase() : <User className="h-8 w-8" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-100">{user?.name}</h3>
              <p className="text-xs text-slate-400 dark:text-zinc-500 font-semibold uppercase">{user?.role}</p>
            </div>
          </Card>

          <Card className="space-y-4">
            <div className="pb-3 border-b border-slate-100 dark:border-zinc-800 flex items-center">
              <User className="h-4.5 w-4.5 text-primary mr-2" /> Personal Information
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Name" name="name" defaultValue={user?.name || ''} readOnly />
              <Input label="Email Address" name="email" defaultValue={user?.email || ''} readOnly />
            </div>
          </Card>

          <Card className="space-y-4">
            <div className="pb-3 border-b border-slate-100 dark:border-zinc-800 flex items-center">
              <Key className="h-4.5 w-4.5 text-primary mr-2" /> Change Password
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Current Password" name="old" type="password" placeholder="••••••••" />
              <Input label="New Password" name="new" type="password" placeholder="••••••••" />
            </div>
            <div className="flex justify-end">
              <Button variant="primary">Update Password</Button>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
