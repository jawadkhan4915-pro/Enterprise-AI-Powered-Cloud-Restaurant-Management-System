import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addToast } from '../../redux/slices/ui.slice';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Skeleton from '../../components/ui/Skeleton';
import api from '../../services/api';
import { Landmark, TrendingUp, TrendingDown, DollarSign, Plus, Filter, Calendar, BarChart3, FileText, Download, Calculator, Percent } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const CATEGORY_COLORS = {
  rent: 'bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400',
  utilities: 'bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400',
  inventory: 'bg-blue-100 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400',
  salaries: 'bg-purple-100 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400',
  marketing: 'bg-pink-100 text-pink-700 dark:bg-pink-950/20 dark:text-pink-400',
  other: 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300',
};

export const FinancePage = () => {
  const dispatch = useDispatch();
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({ totalRevenue: 0, totalExpenses: 0, netProfit: 0 });
  const [loading, setLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [activeTab, setActiveTab] = useState('audit'); // 'audit' or 'analytics'

  // Log Expense modal state
  const [showLogExpense, setShowLogExpense] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    amount: 0,
    category: 'utilities',
    description: '',
    paymentMethod: 'cash',
  });

  useEffect(() => {
    fetchFinanceData();
  }, [categoryFilter]);

  const fetchFinanceData = async () => {
    setLoading(true);
    try {
      const url = categoryFilter ? `/finance/expenses?category=${categoryFilter}` : '/finance/expenses';
      const expensesRes = await api.get(url);
      setExpenses(expensesRes.data.data.items);

      const summaryRes = await api.get('/finance/summary');
      setSummary(summaryRes.data.data.summary);
    } catch (err) {
      dispatch(addToast({ message: 'Error retrieving financial records', type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  const handleLogExpense = async (e) => {
    e.preventDefault();
    if (expenseForm.amount <= 0) {
      dispatch(addToast({ message: 'Please enter a valid expense amount', type: 'error' }));
      return;
    }
    try {
      const res = await api.post('/finance/expenses', expenseForm);
      setExpenses(prev => [res.data.data.expense, ...prev]);
      setShowLogExpense(false);
      setExpenseForm({ amount: 0, category: 'utilities', description: '', paymentMethod: 'cash' });
      dispatch(addToast({ message: 'Expense logged successfully', type: 'success' }));
      
      // Refresh summary statistics
      const summaryRes = await api.get('/finance/summary');
      setSummary(summaryRes.data.data.summary);
    } catch (err) {
      dispatch(addToast({ message: 'Failed to record expense', type: 'error' }));
    }
  };

  const handleDownloadLedger = () => {
    const ledgerRows = [];
    // Add header
    ledgerRows.push(['Date', 'Type', 'Category / Details', 'Debit (Outgoings)', 'Credit (Incomings)', 'Balance Change']);
    
    // Add expenses
    expenses.forEach(exp => {
      ledgerRows.push([
        new Date(exp.date).toLocaleDateString(),
        'Expense',
        `${exp.category.toUpperCase()} - ${exp.description || 'No desc'}`,
        exp.amount.toFixed(2),
        '0.00',
        `-${exp.amount.toFixed(2)}`
      ]);
    });
    
    // Add orders revenue if available
    ledgerRows.push([
      new Date().toLocaleDateString(),
      'Revenue',
      'Aggregated POS Cash Register Collections',
      '0.00',
      summary.totalRevenue.toFixed(2),
      `+${summary.totalRevenue.toFixed(2)}`
    ]);

    const csvContent = ledgerRows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `General_Ledger_Balance_Sheet.csv`;
    a.click();
    URL.revokeObjectURL(url);
    dispatch(addToast({ message: 'General ledger balance sheet exported successfully', type: 'success' }));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-zinc-50 flex items-center">
              <Landmark className="h-6 w-6 mr-2 text-primary" /> Finance & Expenses
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Analyze cash drawers sales revenue, log business utility bills, salaries payouts, and review margins.
            </p>
          </div>
          <Button variant="primary" icon={Plus} onClick={() => setShowLogExpense(true)}>
            Log Expense
          </Button>
        </div>

        {/* Finance Widgets Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="flex items-center space-x-4 border border-slate-100 dark:border-zinc-900 shadow-soft">
            <div className="p-3.5 bg-emerald-100 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-500 rounded-full shrink-0">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Total Revenue</p>
              <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-100">${summary.totalRevenue.toFixed(2)}</h3>
            </div>
          </Card>

          <Card className="flex items-center space-x-4 border border-slate-100 dark:border-zinc-900 shadow-soft">
            <div className="p-3.5 bg-red-100 text-red-650 dark:bg-red-950/20 dark:text-red-500 rounded-full shrink-0">
              <TrendingDown className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Total Expenses</p>
              <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-100">${summary.totalExpenses.toFixed(2)}</h3>
            </div>
          </Card>

          <Card className="flex items-center space-x-4 border border-slate-100 dark:border-zinc-900 shadow-soft">
            <div className="p-3.5 bg-blue-100 text-blue-600 dark:bg-blue-950/20 dark:text-blue-500 rounded-full shrink-0">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Net Profit</p>
              <h3 className={`text-lg font-bold ${summary.netProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                ${summary.netProfit.toFixed(2)}
              </h3>
            </div>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-slate-100 dark:bg-zinc-900 p-1 rounded-card w-fit shrink-0">
          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center px-4 py-2 text-xs font-semibold rounded-input transition-all ${
              activeTab === 'audit'
                ? 'bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 shadow-soft'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700'
            }`}
          >
            <FileText className="h-3.5 w-3.5 mr-1.5" /> Expense Audit Ledger
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center px-4 py-2 text-xs font-semibold rounded-input transition-all ${
              activeTab === 'analytics'
                ? 'bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 shadow-soft'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5 mr-1.5" /> P&L Analytics & Projection
          </button>
        </div>

        {activeTab === 'audit' ? (
          /* Expenses List Table */
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200">Expense Audit Log</h4>
              <div className="flex items-center space-x-2 text-xs text-slate-400">
                <Filter className="h-4 w-4" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-1.5 border bg-white border-slate-205 rounded-input focus:outline-none dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-250"
                >
                  <option value="">All Categories</option>
                  <option value="rent">Rent</option>
                  <option value="utilities">Utilities</option>
                  <option value="inventory">Inventory</option>
                  <option value="salaries">Salaries</option>
                  <option value="marketing">Marketing</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="space-y-3">
                <Skeleton variant="text" height={40} />
                <Skeleton variant="text" height={40} />
              </div>
            ) : expenses.length === 0 ? (
              <Card className="text-center py-12 text-slate-400 font-semibold text-xs border-dashed border-2 border-slate-200 dark:border-zinc-800">
                No logged expenses recorded.
              </Card>
            ) : (
              <Card className="p-0 overflow-hidden border border-slate-100 dark:border-zinc-900 shadow-soft bg-white dark:bg-zinc-950">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-xs text-slate-500 dark:text-zinc-400">
                    <thead className="bg-slate-50/50 dark:bg-zinc-900/30 text-slate-700 dark:text-zinc-250 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-4">Category</th>
                        <th className="p-4">Description</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Payment Method</th>
                        <th className="p-4">Logger</th>
                        <th className="p-4">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-zinc-900/50">
                      {expenses.map((exp) => (
                        <tr key={exp._id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/20">
                          <td className="p-4">
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-pill capitalize ${CATEGORY_COLORS[exp.category] || 'bg-slate-100 text-slate-500'}`}>
                              {exp.category}
                            </span>
                          </td>
                          <td className="p-4 font-semibold text-slate-800 dark:text-zinc-250">{exp.description || 'No description'}</td>
                          <td className="p-4 font-bold text-red-500">${exp.amount.toFixed(2)}</td>
                          <td className="p-4 capitalize">{exp.paymentMethod.replace('_', ' ')}</td>
                          <td className="p-4 font-semibold">{exp.performedBy?.name || 'Owner'}</td>
                          <td className="p-4 text-[10px] text-slate-400">{new Date(exp.date).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        ) : (
          /* Advanced Analytics & Projection Tab */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
            {/* Left side: charts (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <Card className="border border-slate-100 dark:border-zinc-900">
                <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200 mb-4">Revenues vs. Expenses Breakdown</h4>
                {summary.totalRevenue === 0 && summary.totalExpenses === 0 ? (
                  <div className="h-64 flex items-center justify-center text-slate-400 text-xs">No transaction history found to project.</div>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={[
                      { name: 'Revenue', amount: summary.totalRevenue, fill: '#10b981' },
                      { name: 'Expenses', amount: summary.totalExpenses, fill: '#f43f5e' },
                      { name: 'Net Profit', amount: summary.netProfit, fill: '#6366f1' }
                    ]} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} />
                      <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
                      <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Amount']} />
                      <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                        <Cell fill="#10b981" />
                        <Cell fill="#f43f5e" />
                        <Cell fill="#6366f1" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Card>

              {/* Expense Category Distribution Pie Chart */}
              <Card className="border border-slate-100 dark:border-zinc-900">
                <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200 mb-4">Expense Category Weighting</h4>
                {expenses.length === 0 ? (
                  <div className="h-48 flex items-center justify-center text-slate-400 text-xs">No expense items logged yet.</div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <div className="w-full max-w-[200px] h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={Object.entries(
                              expenses.reduce((acc, exp) => {
                                acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
                                return acc;
                              }, {})
                            ).map(([name, value]) => ({ name, value }))}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={70}
                            paddingAngle={3}
                          >
                            {Object.keys(
                              expenses.reduce((acc, exp) => {
                                acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
                                return acc;
                              }, {})
                            ).map((_, i) => (
                              <Cell key={i} fill={['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#64748b'][i % 6]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={v => `$${v.toFixed(2)}`} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-3 w-full">
                      {Object.entries(
                        expenses.reduce((acc, exp) => {
                          acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
                          return acc;
                        }, {})
                      ).map(([cat, total], i) => (
                        <div key={cat} className="flex items-center space-x-2 text-[10px] font-semibold text-slate-600 dark:text-zinc-400">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#64748b'][i % 6] }} />
                          <span className="capitalize truncate flex-1">{cat}</span>
                          <span className="text-slate-800 dark:text-zinc-200 font-bold">${total.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* Right side: Tax liability + Exporter (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Tax Estimator */}
              <Card className="border border-slate-100 dark:border-zinc-900 space-y-4">
                <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center">
                  <Calculator className="h-4.5 w-4.5 mr-1.5 text-primary" /> Tax Liability Estimator
                </h4>
                <p className="text-[10px] text-slate-400">Estimations are calculated based on standard 10% VAT on revenue and 20% estimated corporate tax on net profit margins.</p>
                
                <div className="space-y-3.5 border-t border-slate-100 dark:border-zinc-900 pt-3.5 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-500">Gross Sales Revenue:</span>
                    <span className="text-slate-800 dark:text-zinc-200">${summary.totalRevenue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-500 flex items-center"><Percent className="h-3 w-3 mr-1" /> Est. VAT (10%):</span>
                    <span className="text-amber-500">${(summary.totalRevenue * 0.10).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-500">Taxable Net Profit:</span>
                    <span className={`\${summary.netProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      ${summary.netProfit.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-500">Est. Corporate Tax (20%):</span>
                    <span className="text-red-500">${(Math.max(0, summary.netProfit) * 0.20).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-slate-850 dark:text-zinc-150 border-t border-slate-100 dark:border-zinc-800 pt-3">
                    <span>Projected Net Earnings:</span>
                    <span className="text-primary">${(summary.netProfit - (Math.max(0, summary.netProfit) * 0.20)).toFixed(2)}</span>
                  </div>
                </div>
              </Card>

              {/* Data Export Center */}
              <Card className="border border-slate-100 dark:border-zinc-900 space-y-4">
                <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center">
                  <Download className="h-4.5 w-4.5 mr-1.5 text-primary" /> Financial Reports Center
                </h4>
                <p className="text-[10px] text-slate-400">Generate and export general ledger audits and local accounting files for external systems reconciliation.</p>
                <div className="space-y-3 pt-2">
                  <Button 
                    onClick={handleDownloadLedger} 
                    variant="outline" 
                    className="w-full flex items-center justify-center gap-2 text-xs"
                    icon={Download}
                  >
                    Export General Ledger (CSV)
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Modal Log Expense Form */}
        {showLogExpense && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white border border-slate-100 dark:bg-zinc-950 dark:border-zinc-900 w-full max-w-sm rounded-card p-6 shadow-premium space-y-4 animate-scale-in">
              <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100">Log Business Expense</h3>
              <form onSubmit={handleLogExpense} className="space-y-4">
                <Input 
                  label="Expense Amount ($)" 
                  type="number"
                  step="0.01"
                  value={expenseForm.amount} 
                  onChange={(e) => setExpenseForm(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  required 
                />
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Category</label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm(prev => ({ ...prev, category: e.target.value }))}
                    className="px-3 py-2 text-xs border bg-white border-slate-350 rounded-input focus:outline-none dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200"
                    required
                  >
                    <option value="rent">Rent</option>
                    <option value="utilities">Utilities</option>
                    <option value="inventory">Inventory Supply</option>
                    <option value="salaries">Salaries Roster</option>
                    <option value="marketing">Marketing Campaigns</option>
                    <option value="other">Other Operations</option>
                  </select>
                </div>
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Payment Mode</label>
                  <select
                    value={expenseForm.paymentMethod}
                    onChange={(e) => setExpenseForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                    className="px-3 py-2 text-xs border bg-white border-slate-350 rounded-input focus:outline-none dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200"
                  >
                    <option value="cash">Cash Drawer</option>
                    <option value="card">Company Credit Card</option>
                    <option value="bank_transfer">Bank Wire Transfer</option>
                  </select>
                </div>
                <Input 
                  label="Expense Description / Invoice Detail" 
                  value={expenseForm.description} 
                  onChange={(e) => setExpenseForm(prev => ({ ...prev, description: e.target.value }))}
                />
                <div className="flex justify-end space-x-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => setShowLogExpense(false)}>Cancel</Button>
                  <Button type="submit" variant="primary" size="sm">Record Expense</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default FinancePage;
