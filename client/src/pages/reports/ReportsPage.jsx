import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { addToast } from '../../redux/slices/ui.slice';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import api from '../../services/api';
import {
  BarChart3, TrendingUp, TrendingDown, Package, Users,
  Calendar, Download, RefreshCw, Star, Award, ShoppingBag,
  DollarSign, ArrowUp, ArrowDown, BarChart2,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const COLORS = ['#6366f1', '#22d3ee', '#f59e0b', '#10b981', '#f43f5e', '#8b5cf6'];

const TIER_COLORS = {
  bronze: '#f97316',
  silver: '#94a3b8',
  gold: '#f59e0b',
  platinum: '#10b981',
};

const StatCard = ({ label, value, icon: Icon, color = 'primary', sub }) => (
  <Card className="flex items-center space-x-4 border border-slate-100 dark:border-zinc-900 shadow-soft">
    <div className={`p-3 rounded-full shrink-0 ${color}`}>
      <Icon className="h-5 w-5" />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wide truncate">{label}</p>
      <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-100">{value}</h3>
      {sub && <p className="text-[10px] text-slate-400">{sub}</p>}
    </div>
  </Card>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-card p-2.5 shadow-premium text-xs">
      <p className="font-bold text-slate-700 dark:text-zinc-200 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-semibold">
          {p.name}: {typeof p.value === 'number' ? `$${p.value.toFixed(2)}` : p.value}
        </p>
      ))}
    </div>
  );
};

export const ReportsPage = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('sales');
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  // Data states
  const [salesData, setSalesData] = useState(null);
  const [topItems, setTopItems] = useState([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState([]);
  const [inventoryData, setInventoryData] = useState(null);
  const [customerData, setCustomerData] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate + 'T23:59:59',
      });

      const [salesRes, itemsRes, expensesRes, inventoryRes, customersRes] = await Promise.all([
        api.get(`/reports/sales?${params}`),
        api.get(`/reports/top-items?${params}&limit=8`),
        api.get(`/reports/expenses?${params}`),
        api.get('/reports/inventory'),
        api.get('/reports/customers'),
      ]);

      setSalesData(salesRes.data.data);
      setTopItems(itemsRes.data.data.items);
      setExpenseBreakdown(expensesRes.data.data.breakdown);
      setInventoryData(inventoryRes.data.data);
      setCustomerData(customersRes.data.data);
    } catch {
      dispatch(addToast({ message: 'Error loading report data', type: 'error' }));
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleExportCSV = (data, filename) => {
    if (!data?.length) return;
    const keys = Object.keys(data[0]);
    const csv = [keys.join(','), ...data.map(row => keys.map(k => `"${row[k] ?? ''}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${dateRange.startDate}_${dateRange.endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'sales', label: 'Sales', icon: TrendingUp },
    { id: 'items', label: 'Top Items', icon: ShoppingBag },
    { id: 'expenses', label: 'Expenses', icon: TrendingDown },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'customers', label: 'Customers', icon: Users },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-zinc-50 flex items-center">
              <BarChart3 className="h-6 w-6 mr-2 text-primary" /> Reports & Analytics
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Deep-dive analytics across sales performance, stock valuation, and customer engagement metrics.
            </p>
          </div>
          <Button variant="outline" icon={RefreshCw} size="sm" onClick={fetchAll} loading={loading}>
            Refresh
          </Button>
        </div>

        {/* Date Range Filter */}
        <Card className="flex flex-col sm:flex-row items-start sm:items-center gap-3 border border-slate-100 dark:border-zinc-900 p-3">
          <div className="flex items-center text-xs font-semibold text-slate-500">
            <Calendar className="h-4 w-4 mr-1.5 text-primary" /> Date Range:
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="date"
              value={dateRange.startDate}
              onChange={e => setDateRange(p => ({ ...p, startDate: e.target.value }))}
              className="text-xs border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-input px-2 py-1.5 text-slate-700 dark:text-zinc-200"
            />
            <span className="text-slate-400 text-xs">to</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={e => setDateRange(p => ({ ...p, endDate: e.target.value }))}
              className="text-xs border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-input px-2 py-1.5 text-slate-700 dark:text-zinc-200"
            />
            {/* Quick range presets */}
            {[
              { label: '7D', days: 7 }, { label: '30D', days: 30 }, { label: '90D', days: 90 },
            ].map(({ label, days }) => (
              <button
                key={label}
                onClick={() => setDateRange({
                  startDate: new Date(Date.now() - days * 86400000).toISOString().split('T')[0],
                  endDate: new Date().toISOString().split('T')[0],
                })}
                className="text-[10px] font-bold px-2.5 py-1 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 rounded-pill hover:bg-primary/10 hover:text-primary transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex space-x-1 bg-slate-100 dark:bg-zinc-900 p-1 rounded-card w-fit overflow-x-auto">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center px-4 py-2 text-xs font-semibold rounded-input transition-all whitespace-nowrap ${
                activeTab === id
                  ? 'bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 shadow-soft'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700'
              }`}
            >
              <Icon className="h-3.5 w-3.5 mr-1.5" />
              {label}
            </button>
          ))}
        </div>

        {/* ── SALES TAB ───────────────────────────────────────────────── */}
        {activeTab === 'sales' && (
          <div className="space-y-6">
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => <Skeleton key={i} variant="rectangular" height={90} />)}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard label="Total Revenue" value={`$${(salesData?.totalRevenue || 0).toFixed(2)}`} icon={DollarSign} color="p-3 bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400" />
                  <StatCard label="Total Orders" value={salesData?.totalOrders || 0} icon={ShoppingBag} color="p-3 bg-blue-100 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400" />
                  <StatCard label="Paid Orders" value={salesData?.paidOrders || 0} icon={ArrowUp} color="p-3 bg-purple-100 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400" />
                  <StatCard label="Avg Order Value" value={`$${(salesData?.avgOrderValue || 0).toFixed(2)}`} icon={TrendingUp} color="p-3 bg-amber-100 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400" />
                </div>

                <Card className="border border-slate-100 dark:border-zinc-900">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200">Daily Revenue Trend</h4>
                    <Button variant="outline" size="sm" icon={Download} className="text-[10px] py-1 px-2"
                      onClick={() => handleExportCSV(salesData?.revenueByDay?.map(d => ({ date: d._id, revenue: d.revenue, orders: d.count })), 'daily_revenue')}>
                      Export CSV
                    </Button>
                  </div>
                  {salesData?.revenueByDay?.length ? (
                    <ResponsiveContainer width="100%" height={260}>
                      <AreaChart data={salesData.revenueByDay} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                        <defs>
                          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="_id" tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} />
                        <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#6366f1" strokeWidth={2} fill="url(#revenueGrad)" dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-slate-400 text-xs">No sales data in selected range.</div>
                  )}
                </Card>
              </>
            )}
          </div>
        )}

        {/* ── TOP ITEMS TAB ───────────────────────────────────────────── */}
        {activeTab === 'items' && (
          <div className="space-y-6">
            {loading ? <Skeleton variant="rectangular" height={300} /> : (
              <Card className="border border-slate-100 dark:border-zinc-900">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200">Top Selling Menu Items</h4>
                  <Button variant="outline" size="sm" icon={Download} className="text-[10px] py-1 px-2"
                    onClick={() => handleExportCSV(topItems.map(i => ({ name: i.name, qty: i.totalQuantity, revenue: i.totalRevenue })), 'top_items')}>
                    Export CSV
                  </Button>
                </div>
                {topItems.length ? (
                  <>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={topItems} layout="vertical" margin={{ top: 0, right: 10, bottom: 0, left: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} tickLine={false} width={60} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="totalQuantity" name="Units Sold" fill="#6366f1" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="mt-4 space-y-2">
                      {topItems.map((item, i) => (
                        <div key={item._id} className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-zinc-900/50 last:border-0">
                          <div className="flex items-center space-x-3">
                            <span className="w-5 h-5 rounded-full text-[9px] font-bold flex items-center justify-center" style={{ background: COLORS[i % COLORS.length] + '22', color: COLORS[i % COLORS.length] }}>
                              {i + 1}
                            </span>
                            <span className="text-xs font-semibold text-slate-700 dark:text-zinc-200">{item.name}</span>
                          </div>
                          <div className="flex items-center space-x-4 text-[10px] font-semibold text-slate-400">
                            <span>{item.totalQuantity} sold</span>
                            <span className="text-emerald-500">${item.totalRevenue.toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="h-64 flex items-center justify-center text-slate-400 text-xs">No order data in selected range.</div>
                )}
              </Card>
            )}
          </div>
        )}

        {/* ── EXPENSES TAB ────────────────────────────────────────────── */}
        {activeTab === 'expenses' && (
          <div className="space-y-6">
            {loading ? <Skeleton variant="rectangular" height={300} /> : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border border-slate-100 dark:border-zinc-900">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200 mb-4">Expense Distribution by Category</h4>
                  {expenseBreakdown.length ? (
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie data={expenseBreakdown} dataKey="total" nameKey="_id" cx="50%" cy="50%" outerRadius={90} innerRadius={50}>
                          {expenseBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={v => `$${v.toFixed(2)}`} />
                        <Legend iconType="circle" iconSize={8} formatter={v => <span className="text-[10px] font-semibold text-slate-600 dark:text-zinc-300 capitalize">{v}</span>} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-60 flex items-center justify-center text-slate-400 text-xs">No expenses in selected range.</div>
                  )}
                </Card>

                <Card className="border border-slate-100 dark:border-zinc-900">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200">Expense Totals</h4>
                    <Button variant="outline" size="sm" icon={Download} className="text-[10px] py-1 px-2"
                      onClick={() => handleExportCSV(expenseBreakdown.map(e => ({ category: e._id, total: e.total, transactions: e.count })), 'expenses')}>
                      Export CSV
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {expenseBreakdown.map((exp, i) => {
                      const maxAmt = Math.max(...expenseBreakdown.map(e => e.total), 1);
                      return (
                        <div key={exp._id} className="space-y-1">
                          <div className="flex justify-between text-[10px] font-semibold">
                            <span className="text-slate-600 dark:text-zinc-300 capitalize">{exp._id}</span>
                            <span className="text-slate-800 dark:text-zinc-200">${exp.total.toFixed(2)} ({exp.count} txns)</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${(exp.total / maxAmt) * 100}%`, background: COLORS[i % COLORS.length] }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* ── INVENTORY TAB ───────────────────────────────────────────── */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            {loading ? (
              <div className="grid grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => <Skeleton key={i} variant="rectangular" height={90} />)}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatCard label="Total SKUs" value={inventoryData?.totalItems || 0} icon={Package} color="p-3 bg-blue-100 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400" />
                  <StatCard label="Stock Value" value={`$${(inventoryData?.totalStockValue || 0).toFixed(2)}`} icon={DollarSign} color="p-3 bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400" />
                  <StatCard label="Low Stock Alerts" value={inventoryData?.lowStockCount || 0} icon={ArrowDown} color="p-3 bg-red-100 text-red-500 dark:bg-red-950/30 dark:text-red-400" sub="Items below minimum" />
                </div>
                {inventoryData?.byCategory?.length && (
                  <Card className="border border-slate-100 dark:border-zinc-900">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200 mb-4">Stock Value by Category</h4>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={inventoryData.byCategory} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="_id" tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} />
                        <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
                        <Tooltip formatter={v => `$${v.toFixed(2)}`} />
                        <Bar dataKey="stockValue" name="Value" fill="#22d3ee" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>
                )}
              </>
            )}
          </div>
        )}

        {/* ── CUSTOMERS TAB ───────────────────────────────────────────── */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            {loading ? (
              <div className="grid grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => <Skeleton key={i} variant="rectangular" height={90} />)}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatCard label="Total Customers" value={customerData?.totalCustomers || 0} icon={Users} color="p-3 bg-purple-100 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400" />
                  <StatCard label="Total Visits" value={customerData?.totalVisits || 0} icon={Award} color="p-3 bg-amber-100 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400" />
                  <StatCard label="Lifetime Revenue" value={`$${(customerData?.totalRevenue || 0).toFixed(2)}`} icon={DollarSign} color="p-3 bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400" />
                </div>
                {customerData?.tierBreakdown?.length && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="border border-slate-100 dark:border-zinc-900">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200 mb-4">Loyalty Tier Distribution</h4>
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie data={customerData.tierBreakdown} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={90} innerRadius={50}>
                            {customerData.tierBreakdown.map((entry, i) => (
                              <Cell key={i} fill={TIER_COLORS[entry._id] || COLORS[i % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend iconType="circle" iconSize={8} formatter={v => <span className="text-[10px] font-semibold text-slate-600 dark:text-zinc-300 capitalize">{v}</span>} />
                        </PieChart>
                      </ResponsiveContainer>
                    </Card>
                    <Card className="border border-slate-100 dark:border-zinc-900">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200 mb-4">Revenue by Tier</h4>
                      <div className="space-y-3">
                        {customerData.tierBreakdown.map((tier) => {
                          const maxSpent = Math.max(...customerData.tierBreakdown.map(t => t.totalSpent), 1);
                          return (
                            <div key={tier._id} className="space-y-1">
                              <div className="flex justify-between text-[10px] font-semibold">
                                <span className="capitalize text-slate-600 dark:text-zinc-300">{tier._id} ({tier.count} customers)</span>
                                <span className="text-slate-800 dark:text-zinc-200">${tier.totalSpent.toFixed(2)}</span>
                              </div>
                              <div className="h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${(tier.totalSpent / maxSpent) * 100}%`, background: TIER_COLORS[tier._id] || '#6366f1' }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ReportsPage;
