import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addToast } from '../../redux/slices/ui.slice';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Skeleton from '../../components/ui/Skeleton';
import api from '../../services/api';
import { Users, Search, Plus, Award, User, Phone, Mail, Award as LoyaltyIcon, PlusCircle, AlertCircle } from 'lucide-react';

const TIER_COLORS = {
  bronze: 'bg-orange-100 text-orange-700 dark:bg-orange-950/20 dark:text-orange-400',
  silver: 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300',
  gold: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/20 dark:text-yellow-400',
  platinum: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400',
};

export const CRMPage = () => {
  const dispatch = useDispatch();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  
  // Create customer drawer modal
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [customerForm, setCustomerForm] = useState({ name: '', phone: '', email: '', loyaltyPoints: 0 });

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const url = search ? `/crm?search=${search}` : '/crm';
      const res = await api.get(url);
      setCustomers(res.data.data.items);
    } catch (err) {
      dispatch(addToast({ message: 'Error retrieving CRM database', type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    if (!customerForm.name.trim() || !customerForm.phone.trim()) {
      dispatch(addToast({ message: 'Name and Phone number are required', type: 'error' }));
      return;
    }
    try {
      const res = await api.post('/crm', customerForm);
      setCustomers(prev => [res.data.data.customer, ...prev]);
      setCustomerForm({ name: '', phone: '', email: '', loyaltyPoints: 0 });
      setShowAddCustomer(false);
      dispatch(addToast({ message: 'Customer profile registered successfully', type: 'success' }));
    } catch (err) {
      dispatch(addToast({ message: 'Failed to create customer profile', type: 'error' }));
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-zinc-50 flex items-center">
              <Users className="h-6 w-6 mr-2 text-primary" /> CRM & Loyalty Programs
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Maintain customer directories, loyalty point tiers, segment statistics, and visit history.
            </p>
          </div>
          <Button variant="primary" icon={Plus} onClick={() => setShowAddCustomer(true)}>
            Add Customer
          </Button>
        </div>

        {/* Search */}
        <div className="flex items-center bg-white border border-slate-200 dark:bg-zinc-900 dark:border-zinc-800 px-3 py-2 rounded-card shadow-soft max-w-sm">
          <Search className="h-4.5 w-4.5 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs bg-transparent focus:outline-none text-slate-800 dark:text-zinc-200"
          />
        </div>

        {/* Customer Directory Cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => <Skeleton key={i} variant="rectangular" height={160} />)}
          </div>
        ) : customers.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2 border-slate-200 dark:border-zinc-800">
            <Users className="h-8 w-8 text-slate-300 dark:text-zinc-700 mx-auto mb-2" />
            <h4 className="font-bold text-slate-700 dark:text-zinc-300">No customers found</h4>
            <p className="text-xs text-slate-400 mt-1">Add a customer to track visit metrics and loyalty points.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {customers.map((c) => (
              <Card key={c._id} className="p-4 flex flex-col justify-between border border-slate-100 dark:border-zinc-900 hover:shadow-premium transition-all space-y-4">
                {/* Profile Top Row */}
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-100">{c.name}</h4>
                    <div className="flex items-center text-[10px] text-slate-400 space-x-1 mt-0.5">
                      <Phone className="h-3 w-3 mr-0.5 text-slate-400" />
                      <span>{c.phone}</span>
                    </div>
                    {c.email && (
                      <div className="flex items-center text-[10px] text-slate-400 space-x-1">
                        <Mail className="h-3 w-3 mr-0.5 text-slate-400" />
                        <span className="truncate max-w-[150px]">{c.email}</span>
                      </div>
                    )}
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-pill capitalize shrink-0 ${TIER_COLORS[c.loyaltyTier]}`}>
                    {c.loyaltyTier}
                  </span>
                </div>

                {/* Loyalty Point Tracker */}
                <div className="bg-slate-50/50 dark:bg-zinc-900/30 p-2.5 rounded-card space-y-1.5 border border-slate-50 dark:border-zinc-900/50">
                  <div className="flex justify-between text-[10px] font-semibold text-slate-500">
                    <span className="flex items-center"><Award className="h-3.5 w-3.5 text-primary mr-1" /> Loyalty Points</span>
                    <span className="font-bold text-slate-700 dark:text-zinc-300">{c.loyaltyPoints} pts</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-semibold text-slate-400 pt-1 border-t border-slate-100 dark:border-zinc-800">
                    <span>Visits: {c.visitCount}</span>
                    <span>Spent: ${c.totalSpent.toFixed(2)}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Modal Customer Onboarding */}
        {showAddCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white border border-slate-100 dark:bg-zinc-950 dark:border-zinc-900 w-full max-w-sm rounded-card p-6 shadow-premium space-y-4 animate-scale-in">
              <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100">Add New Customer</h3>
              <form onSubmit={handleCreateCustomer} className="space-y-4">
                <Input 
                  label="Full Name" 
                  value={customerForm.name} 
                  onChange={(e) => setCustomerForm(prev => ({ ...prev, name: e.target.value }))}
                  required 
                />
                <Input 
                  label="Phone Number" 
                  value={customerForm.phone} 
                  onChange={(e) => setCustomerForm(prev => ({ ...prev, phone: e.target.value }))}
                  required 
                />
                <Input 
                  label="Email (optional)" 
                  type="email"
                  value={customerForm.email} 
                  onChange={(e) => setCustomerForm(prev => ({ ...prev, email: e.target.value }))}
                />
                <Input 
                  label="Starting Points" 
                  type="number"
                  value={customerForm.loyaltyPoints} 
                  onChange={(e) => setCustomerForm(prev => ({ ...prev, loyaltyPoints: parseInt(e.target.value, 10) || 0 }))}
                />
                <div className="flex justify-end space-x-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => setShowAddCustomer(false)}>Cancel</Button>
                  <Button type="submit" variant="primary" size="sm">Create Customer</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CRMPage;
