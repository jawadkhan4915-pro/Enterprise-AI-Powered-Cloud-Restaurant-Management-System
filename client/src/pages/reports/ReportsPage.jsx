import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import { BarChart3 } from 'lucide-react';

export const ReportsPage = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-zinc-50">
            Reports & Audits Builder
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Generate printable reports for sales summaries, stock movement logs, tax returns. (Available in Phase 7)
          </p>
        </div>

        <Card className="flex flex-col items-center justify-center h-96 border-dashed border-2 border-slate-200 dark:border-zinc-800">
          <div className="p-4 bg-primary/10 rounded-full text-primary mb-4">
            <BarChart3 className="h-8 w-8" />
          </div>
          <h3 className="font-bold text-slate-700 dark:text-zinc-200">Custom Reports Exporter</h3>
          <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1 max-w-sm text-center">
            Printable PDF generation schemas, Excel downloads, and custom date range filter tools will be set up here.
          </p>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ReportsPage;
