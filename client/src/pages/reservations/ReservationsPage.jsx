import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import { Calendar } from 'lucide-react';

export const ReservationsPage = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-zinc-50">
            Bookings & Reservations
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Reserve guest tables, manage calendar waitlists, and send SMS updates. (Available in Phase 6)
          </p>
        </div>

        <Card className="flex flex-col items-center justify-center h-96 border-dashed border-2 border-slate-200 dark:border-zinc-800">
          <div className="p-4 bg-primary/10 rounded-full text-primary mb-4">
            <Calendar className="h-8 w-8" />
          </div>
          <h3 className="font-bold text-slate-700 dark:text-zinc-200">Table booking planner</h3>
          <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1 max-w-sm text-center">
            Booking grids, guest logs, and SMS alert configurations will be built here inside the CRM layouts.
          </p>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ReservationsPage;
