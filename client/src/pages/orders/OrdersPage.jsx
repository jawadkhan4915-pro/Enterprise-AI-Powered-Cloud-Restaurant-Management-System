import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import { Receipt } from 'lucide-react';

export const OrdersPage = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-zinc-50">
            Order History & Logs
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Browse active tickets, tables splits, and delivery statuses. (Available in Phase 4)
          </p>
        </div>

        <Card className="flex flex-col items-center justify-center h-96 border-dashed border-2 border-slate-200 dark:border-zinc-800">
          <div className="p-4 bg-primary/10 rounded-full text-primary mb-4">
            <Receipt className="h-8 w-8" />
          </div>
          <h3 className="font-bold text-slate-700 dark:text-zinc-200">Order Logs Module</h3>
          <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1 max-w-sm text-center">
            Active and historic tickets logs will display here inside a high-speed search table layout.
          </p>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default OrdersPage;
