import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addToast } from '../../redux/slices/ui.slice';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Skeleton from '../../components/ui/Skeleton';
import api from '../../services/api';
import { Landmark, TrendingUp, TrendingDown, DollarSign, Plus, Filter, Calendar } from 'lucide-react';

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

        {/* Expenses List Table */}
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
