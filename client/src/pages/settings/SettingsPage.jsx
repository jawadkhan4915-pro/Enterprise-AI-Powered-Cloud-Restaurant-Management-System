import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Settings, Save, Sliders, Shield, Printer, Bell, Palette } from 'lucide-react';

export const SettingsPage = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-zinc-50">
            System Settings
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Configure system rules, printing formats, notification alerts, and appearance variables.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Navigation tabs column */}
          <Card className="p-3 space-y-1 md:col-span-1 h-fit">
            <button className="flex items-center w-full px-3 py-2 text-xs font-semibold bg-primary/10 text-primary rounded-input">
              <Sliders className="h-4 w-4 mr-2.5" /> General Business
            </button>
            <button className="flex items-center w-full px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 rounded-input dark:text-zinc-400 dark:hover:bg-zinc-900">
              <Printer className="h-4 w-4 mr-2.5" /> Receipt Printers
            </button>
            <button className="flex items-center w-full px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 rounded-input dark:text-zinc-400 dark:hover:bg-zinc-900">
              <Bell className="h-4 w-4 mr-2.5" /> Notifications
            </button>
            <button className="flex items-center w-full px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 rounded-input dark:text-zinc-400 dark:hover:bg-zinc-900">
              <Shield className="h-4 w-4 mr-2.5" /> Security & Keys
            </button>
          </Card>

          {/* Form details column */}
          <div className="md:col-span-3 space-y-6">
            <Card className="space-y-4">
              <div className="pb-3 border-b border-slate-100 dark:border-zinc-800">
                <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200">General Profile</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Restaurant Name" name="rname" defaultValue="London Central Cafe" />
                <Input label="Contact Phone" name="rphone" defaultValue="+44 20 7946 0958" />
                <Input label="VAT / Tax Number" name="rtax" defaultValue="GB987654321" />
                <Input label="Base Currency Symbol" name="rcurr" defaultValue="GBP (£)" />
              </div>
            </Card>

            <Card className="space-y-4">
              <div className="pb-3 border-b border-slate-100 dark:border-zinc-800">
                <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200">Operational Toggles</h3>
              </div>
              <div className="space-y-3.5 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-700 dark:text-zinc-300">Enable Table Auto-Checkout</p>
                    <p className="text-slate-400 dark:text-zinc-500">Automatically free tables when transaction is paid</p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4 accent-primary rounded cursor-pointer" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-700 dark:text-zinc-300">Automatic Stock Deduction</p>
                    <p className="text-slate-400 dark:text-zinc-500">Deduct warehouse inventory values when cashier logs POS ticket payment</p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4 accent-primary rounded cursor-pointer" />
                </div>
              </div>
            </Card>

            <div className="flex justify-end">
              <Button variant="primary" icon={Save}>Save Settings</Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
