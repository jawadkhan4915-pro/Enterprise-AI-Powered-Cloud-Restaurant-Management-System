import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import { DollarSign } from 'lucide-react';

export const FinancePage = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-zinc-50">
            Finance & Profit/Loss (P&L)
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Analyze expenses ledger records, incoming cash registry, taxes data, and invoices. (Available in Phase 6)
          </p>
        </div>

        <Card className="flex flex-col items-center justify-center h-96 border-dashed border-2 border-slate-200 dark:border-zinc-800">
          <div className="p-4 bg-primary/10 rounded-full text-primary mb-4">
            <DollarSign className="h-8 w-8" />
          </div>
          <h3 className="font-bold text-slate-700 dark:text-zinc-200">Financial Ledger</h3>
          <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1 max-w-sm text-center">
            P&L charts, expense listings, cash register balances, and tax receipts details will be displayed here.
          </p>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default FinancePage;
