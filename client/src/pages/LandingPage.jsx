import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  Shield, 
  Cpu, 
  ChefHat, 
  Activity, 
  TrendingUp, 
  Package, 
  Users, 
  DollarSign, 
  Layers 
} from 'lucide-react';
import Button from '../components/ui/Button';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-zinc-950 dark:text-zinc-100 font-sans selection:bg-primary selection:text-white transition-colors duration-300">
      
      {/* Premium Gradient Backgrounds */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none overflow-hidden opacity-40 dark:opacity-20">
        <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] rounded-full bg-emerald-400/30 blur-[100px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[20%] right-[15%] w-[450px] h-[450px] rounded-full bg-blue-400/30 blur-[120px] animate-pulse" style={{ animationDuration: '12s' }} />
      </div>

      {/* Navigation Top Bar */}
      <header className="sticky top-0 z-50 glass-effect border-b border-slate-200/50 dark:border-zinc-800/40 px-6 lg:px-16 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 bg-primary/10 text-primary rounded-card">
            <ChefHat className="h-5 w-5" />
          </div>
          <span className="font-bold text-slate-900 dark:text-zinc-50 tracking-tight text-lg">RestaurantOS</span>
          <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-pill">AI</span>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/login">
            <Button variant="text" size="sm" className="font-semibold">Sign In</Button>
          </Link>
          <Link to="/register">
            <Button variant="primary" size="sm" className="shadow-soft hover:scale-[1.02] transition-transform duration-200">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 lg:px-16 pt-20 pb-24 text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center space-x-2 bg-slate-200/50 dark:bg-zinc-900/60 border border-slate-300/30 dark:border-zinc-800/50 px-3 py-1 rounded-pill text-[11px] font-semibold tracking-wide text-slate-600 dark:text-zinc-400 uppercase">
          <Sparkles className="h-3 w-3 text-primary animate-pulse" />
          <span>The Future of Hospitality is Agentic</span>
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-950 dark:text-zinc-50 leading-[1.15] bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 dark:from-white dark:via-zinc-300 dark:to-zinc-100 bg-clip-text text-transparent">
          Enterprise Cloud Restaurant OS Powered by <span className="bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">Local AI</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          A high-performance SaaS dashboard combining Touch POS, automated inventories, multi-floor tables layout, and a dedicated local AI assistant layer supporting Ollama, LM Studio, and OpenRouter today.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
          <Link to="/login">
            <Button variant="primary" size="md" icon={ArrowRight} iconPosition="right" className="w-full sm:w-auto px-8 py-3 text-sm rounded-card shadow-premium hover:shadow-soft transition-all duration-300">
              Launch Demo Dashboard
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="outline" size="md" className="w-full sm:w-auto px-8 py-3 text-sm rounded-card hover:bg-slate-100/50 dark:hover:bg-zinc-900/50">
              Register Restaurant
            </Button>
          </Link>
        </div>
      </section>

      {/* Product Screenshot Glass Mockup */}
      <section className="px-6 lg:px-16 max-w-5xl mx-auto pb-24">
        <div className="relative rounded-card overflow-hidden border border-slate-200/60 dark:border-zinc-800/40 bg-white/40 dark:bg-zinc-900/20 p-2.5 shadow-premium backdrop-blur-md animate-fade-in">
          <div className="rounded-card overflow-hidden border border-slate-200/80 dark:border-zinc-800/60 bg-white dark:bg-zinc-950 h-[380px] sm:h-[480px] p-6 space-y-6 flex flex-col justify-between">
            {/* Mock Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-900">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              <div className="text-[10px] font-mono bg-slate-100 dark:bg-zinc-900 text-slate-400 dark:text-zinc-500 px-3 py-1 rounded-pill select-none">
                https://app.restaurantos.ai/dashboard
              </div>
              <div className="w-4 h-4 rounded-full bg-slate-100 dark:bg-zinc-900" />
            </div>

            {/* Mock Grid */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-hidden pt-2">
              {/* Left Mock Cards */}
              <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50/50 dark:bg-zinc-900/40 border border-slate-100 dark:border-zinc-800 rounded-card space-y-2">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Today's Sales</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-zinc-50">$4,824.50</p>
                    <span className="text-[9px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 px-1.5 py-0.5 rounded-pill">↑ 12% Growth</span>
                  </div>
                  <div className="p-4 bg-slate-50/50 dark:bg-zinc-900/40 border border-slate-100 dark:border-zinc-800 rounded-card space-y-2">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Tables</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-zinc-50">14 / 20 Seated</p>
                    <span className="text-[9px] font-bold text-blue-500 bg-blue-50 dark:bg-blue-950/20 px-1.5 py-0.5 rounded-pill">70% Occupancy</span>
                  </div>
                </div>
                <div className="p-4 bg-slate-50/50 dark:bg-zinc-900/40 border border-slate-100 dark:border-zinc-800 rounded-card h-40 flex flex-col justify-between">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-zinc-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">AI Assistant suggestions</span>
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-500 dark:text-zinc-400 italic">
                    "Weekly revenue is forecasted to hit $18,420.00. Based on burn velocity rates, we recommend placing a restock purchase of 15kg Salmon Fillets with FreshMart Suppliers to prevent weekend depletion."
                  </p>
                  <div className="h-2 bg-slate-200 dark:bg-zinc-800 rounded-pill overflow-hidden">
                    <div className="h-full bg-primary w-3/4 rounded-pill" />
                  </div>
                </div>
              </div>

              {/* Right Mock Order List */}
              <div className="hidden md:block p-4 bg-slate-50/50 dark:bg-zinc-900/40 border border-slate-100 dark:border-zinc-800 rounded-card space-y-3">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Recent Orders Feed</p>
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center text-[10px] border-b border-slate-100 dark:border-zinc-800 pb-1.5">
                    <span className="font-bold text-slate-700 dark:text-zinc-300">Order #1024 (Dine-In)</span>
                    <span className="text-emerald-500 font-bold">Paid</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] border-b border-slate-100 dark:border-zinc-800 pb-1.5">
                    <span className="font-bold text-slate-700 dark:text-zinc-300">Order #1025 (Takeaway)</span>
                    <span className="text-amber-500 font-bold">Preparing</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] border-b border-slate-100 dark:border-zinc-800 pb-1.5">
                    <span className="font-bold text-slate-700 dark:text-zinc-300">Order #1026 (Delivery)</span>
                    <span className="text-blue-500 font-bold">Ready</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] pb-0.5">
                    <span className="font-bold text-slate-700 dark:text-zinc-300">Order #1027 (Dine-In)</span>
                    <span className="text-slate-400 font-bold">Pending</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modular Modules Grid */}
      <section className="px-6 lg:px-16 max-w-6xl mx-auto pb-24 space-y-12">
        <div className="text-center space-y-2.5">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-50">Complete System Feature Abstraction</h2>
          <p className="text-slate-500 dark:text-zinc-400 max-w-xl mx-auto text-xs">
            Engineered with SOLID coding standards, clean architecture layers, and optimized database queries.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-white dark:bg-zinc-900/30 border border-slate-100 dark:border-zinc-900 rounded-card shadow-soft hover:-translate-y-1 transition-transform duration-300 space-y-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-card w-fit">
              <Cpu className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-slate-800 dark:text-zinc-200 text-sm">Modular AI Engine</h4>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
              Plug in local LLMs via Ollama, LM Studio or cloud systems via OpenAI and OpenRouter in a click.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-zinc-900/30 border border-slate-100 dark:border-zinc-900 rounded-card shadow-soft hover:-translate-y-1 transition-transform duration-300 space-y-3">
            <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-card w-fit">
              <Activity className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-slate-800 dark:text-zinc-200 text-sm">Touch-First POS & Kitchen</h4>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
              Split bills, calculate discounts, print receipts, and track cooking times via the live Kitchen Display system.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-zinc-900/30 border border-slate-100 dark:border-zinc-900 rounded-card shadow-soft hover:-translate-y-1 transition-transform duration-300 space-y-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-card w-fit">
              <Package className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-slate-800 dark:text-zinc-200 text-sm">Predictive Inventory</h4>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
              Track batches, warehouses, expiry warnings, and auto-calculate margin markups with waste reduction recipes.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-zinc-900/30 border border-slate-100 dark:border-zinc-900 rounded-card shadow-soft hover:-translate-y-1 transition-transform duration-300 space-y-3">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-500 rounded-card w-fit">
              <Users className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-slate-800 dark:text-zinc-200 text-sm">CRM & Shift Schedules</h4>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
              Segment client spending history, reward loyalty points, manage employee shifts, logs, and process invoices.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/50 dark:border-zinc-900/80 py-8 text-center text-xs text-slate-400 dark:text-zinc-650">
        <p>© 2026 RestaurantOS AI Inc. Designed in compliance with Apple and Stripe design principles.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
