import React from 'react';
import { Bell, Info, AlertTriangle, Calendar, Package, X } from 'lucide-react';
import Card from '../ui/Card';

export const NotificationPanel = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const mockNotifications = [
    {
      id: '1',
      title: 'Low Stock Warning',
      description: 'Tomato Sauce supply is below 15% threshold (2.5kg remaining).',
      time: '10m ago',
      type: 'warning',
      icon: Package,
      iconClass: 'bg-amber-100 text-amber-600 dark:bg-amber-950/30 dark:text-amber-500',
    },
    {
      id: '2',
      title: 'New Online Reservation',
      description: 'Table 14 reserved by Jawad Khan for 4 guests.',
      time: '25m ago',
      type: 'reservation',
      icon: Calendar,
      iconClass: 'bg-blue-100 text-blue-600 dark:bg-blue-950/30 dark:text-blue-500',
    },
    {
      id: '3',
      title: 'AI Stock Recommendation',
      description: 'Order 50kg Flour today to avoid shortage before weekend rush.',
      time: '1h ago',
      type: 'info',
      icon: Info,
      iconClass: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-500',
    },
  ];

  return (
    <>
      {/* Invisible overlay to catch clicks and close */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Notifications container */}
      <Card className="absolute right-0 mt-2.5 w-80 p-0 z-50 animate-scale-in border border-slate-100 dark:border-zinc-900 shadow-premium overflow-hidden bg-white dark:bg-zinc-950">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-zinc-900">
          <span className="font-bold text-sm text-slate-800 dark:text-zinc-100 flex items-center">
            <Bell className="h-4 w-4 mr-2 text-primary" /> Notifications
          </span>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* List */}
        <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-900">
          {mockNotifications.map((notif) => {
            const Icon = notif.icon;
            return (
              <div key={notif.id} className="p-4 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors flex space-x-3">
                <div className={`p-2 rounded-card shrink-0 h-9 w-9 flex items-center justify-center ${notif.iconClass}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-baseline">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200">{notif.title}</h4>
                    <span className="text-[9px] text-slate-400 dark:text-zinc-500">{notif.time}</span>
                  </div>
                  <p className="text-[11px] leading-normal text-slate-500 dark:text-zinc-400">{notif.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-zinc-900/50 text-center border-t border-slate-100 dark:border-zinc-900">
          <a href="/notifications" className="text-xs font-semibold text-primary hover:text-primary-dark">
            View all alerts
          </a>
        </div>
      </Card>
    </>
  );
};

export default NotificationPanel;
