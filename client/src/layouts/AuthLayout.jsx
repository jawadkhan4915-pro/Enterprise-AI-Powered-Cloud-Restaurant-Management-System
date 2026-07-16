import React from 'react';
import { ChefHat } from 'lucide-react';

export const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-zinc-950 transition-colors duration-200">
      {/* Visual Side Banner (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-tr from-emerald-600 via-primary to-teal-500 overflow-hidden items-center justify-center p-12">
        {/* Animated background blobs */}
        <div className="absolute top-1/4 -left-12 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-12 w-80 h-80 bg-emerald-300/10 rounded-full blur-3xl animate-pulse delay-1000" />
        
        <div className="relative z-10 text-white max-w-md space-y-6">
          <div className="flex items-center space-x-3">
            <ChefHat className="h-10 w-10 text-white drop-shadow-md" />
            <span className="text-2xl font-bold tracking-tight">RestaurantOS AI</span>
          </div>
          <h1 className="text-4xl font-bold leading-tight">
            The complete operating system for modern restaurants.
          </h1>
          <p className="text-emerald-100 text-sm leading-relaxed">
            Enterprise-grade cloud features with real-time POS processing, predictive AI insights, automatic inventory deduction, and kitchen flows.
          </p>
          <div className="flex items-center space-x-4 pt-4 border-t border-white/20 text-xs text-emerald-100/80">
            <div>✓ Single cafe to franchise scaling</div>
            <div>✓ Multi-branch layout tools</div>
          </div>
        </div>
      </div>

      {/* Auth Forms Side */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 md:p-16">
        <div className="w-full max-w-md space-y-8 animate-scale-in">
          {/* Mobile Header Branding */}
          <div className="lg:hidden flex flex-col items-center space-y-2 mb-6">
            <div className="p-2.5 bg-primary/10 rounded-card text-primary">
              <ChefHat className="h-8 w-8" />
            </div>
            <span className="text-xl font-bold dark:text-zinc-50">RestaurantOS AI</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-slate-500 dark:text-zinc-400">
                {subtitle}
              </p>
            )}
          </div>

          {/* Form wrapper */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-8 rounded-card shadow-soft">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
