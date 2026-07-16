import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addToast } from '../../redux/slices/ui.slice';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Skeleton from '../../components/ui/Skeleton';
import api from '../../services/api';
import { Users, Plus, Search, Calendar, Phone, Mail, DollarSign, Clock, ShieldAlert, Award } from 'lucide-react';

const ROLE_COLORS = {
  waiter: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400',
  chef: 'bg-blue-100 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400',
  cashier: 'bg-yellow-100 text-yellow-750 dark:bg-yellow-950/20 dark:text-yellow-450',
  manager: 'bg-purple-100 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400',
};

export const EmployeesPage = () => {
  const dispatch = useDispatch();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  
  // Modals onboarding state
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [employeeForm, setEmployeeForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'waiter',
    salary: 15,
    hourlyRate: 15,
    shift: { start: '09:00', end: '17:00' },
  });

  useEffect(() => {
    fetchEmployees();
  }, [search]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const url = search ? `/employees?search=${search}` : '/employees';
      const res = await api.get(url);
      setEmployees(res.data.data.items);
    } catch (err) {
      dispatch(addToast({ message: 'Error loading employees roster', type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    if (!employeeForm.name.trim() || !employeeForm.email.trim()) {
      dispatch(addToast({ message: 'Name and email are required', type: 'error' }));
      return;
    }
    try {
      const res = await api.post('/employees', employeeForm);
      setEmployees(prev => [res.data.data.employee, ...prev]);
      setEmployeeForm({
        name: '',
        email: '',
        phone: '',
        role: 'waiter',
        salary: 15,
        hourlyRate: 15,
        shift: { start: '09:00', end: '17:00' },
      });
      setShowAddEmployee(false);
      dispatch(addToast({ message: 'Employee file created successfully', type: 'success' }));
    } catch (err) {
      dispatch(addToast({ message: 'Failed to onboard employee', type: 'error' }));
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (!window.confirm('Are you sure you want to delete this employee file?')) return;
    try {
      await api.delete(`/employees/${employeeId}`);
      setEmployees(prev => prev.filter(e => e._id !== employeeId));
      dispatch(addToast({ message: 'Employee profile soft deleted', type: 'info' }));
    } catch (err) {
      dispatch(addToast({ message: 'Failed to delete employee file', type: 'error' }));
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-zinc-50 flex items-center">
              <Users className="h-6 w-6 mr-2 text-primary" /> Employees Directory
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Onboard new staff, assign shift timings, list active wages, and review payroll statistics.
            </p>
          </div>
          <Button variant="primary" icon={Plus} onClick={() => setShowAddEmployee(true)}>
            Onboard Staff
          </Button>
        </div>

        {/* Search */}
        <div className="flex items-center bg-white border border-slate-200 dark:bg-zinc-900 dark:border-zinc-800 px-3 py-2 rounded-card shadow-soft max-w-sm">
          <Search className="h-4.5 w-4.5 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Search roster by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs bg-transparent focus:outline-none text-slate-800 dark:text-zinc-200"
          />
        </div>

        {/* Directory grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => <Skeleton key={i} variant="rectangular" height={160} />)}
          </div>
        ) : employees.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2 border-slate-200 dark:border-zinc-800">
            <Users className="h-8 w-8 text-slate-300 dark:text-zinc-700 mx-auto mb-2" />
            <h4 className="font-bold text-slate-700 dark:text-zinc-300">Roster Empty</h4>
            <p className="text-xs text-slate-400 mt-1">Register waiters, chefs, or cashiers to start shift tracking.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {employees.map((emp) => (
              <Card key={emp._id} className="p-4 flex flex-col justify-between border border-slate-100 dark:border-zinc-900 hover:shadow-premium transition-all space-y-4">
                {/* Details Top */}
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-100 truncate">{emp.name}</h4>
                    <div className="flex items-center text-[10px] text-slate-400 space-x-1 mt-0.5">
                      <Mail className="h-3 w-3 mr-0.5 text-slate-450" />
                      <span className="truncate">{emp.email}</span>
                    </div>
                    {emp.phone && (
                      <div className="flex items-center text-[10px] text-slate-400 space-x-1">
                        <Phone className="h-3 w-3 mr-0.5 text-slate-450" />
                        <span>{emp.phone}</span>
                      </div>
                    )}
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-pill capitalize shrink-0 ${ROLE_COLORS[emp.role] || 'bg-slate-100 text-slate-500'}`}>
                    {emp.role}
                  </span>
                </div>

                {/* Shifts & Wages Panel */}
                <div className="bg-slate-50/50 dark:bg-zinc-900/30 p-3 rounded-card space-y-2 border border-slate-50 dark:border-zinc-900/50">
                  <div className="flex justify-between items-center text-[10px] font-semibold text-slate-500">
                    <span className="flex items-center"><Clock className="h-3.5 w-3.5 mr-1" /> Shift Time</span>
                    <span className="text-slate-700 dark:text-zinc-300 font-bold">{emp.shift?.start} - {emp.shift?.end}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-semibold text-slate-500 pt-1 border-t border-slate-100 dark:border-zinc-800">
                    <span className="flex items-center"><DollarSign className="h-3.5 w-3.5 mr-1 text-emerald-500" /> Wages</span>
                    <span className="text-slate-750 dark:text-zinc-300 font-bold">${emp.salary}/hr</span>
                  </div>
                </div>

                {/* Terminate trigger button */}
                <div className="flex justify-end pt-1 border-t border-slate-50 dark:border-zinc-900/50">
                  <Button 
                    variant="text" 
                    size="sm" 
                    className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 py-1"
                    onClick={() => handleDeleteEmployee(emp._id)}
                  >
                    Delete File
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Modal Onboard Form */}
        {showAddEmployee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white border border-slate-100 dark:bg-zinc-950 dark:border-zinc-900 w-full max-w-sm rounded-card p-6 shadow-premium space-y-4 animate-scale-in">
              <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100">Onboard Staff Member</h3>
              <form onSubmit={handleCreateEmployee} className="space-y-4">
                <Input 
                  label="Full Name" 
                  value={employeeForm.name} 
                  onChange={(e) => setEmployeeForm(prev => ({ ...prev, name: e.target.value }))}
                  required 
                />
                <Input 
                  label="Email" 
                  type="email"
                  value={employeeForm.email} 
                  onChange={(e) => setEmployeeForm(prev => ({ ...prev, email: e.target.value }))}
                  required 
                />
                <Input 
                  label="Phone Number" 
                  value={employeeForm.phone} 
                  onChange={(e) => setEmployeeForm(prev => ({ ...prev, phone: e.target.value }))}
                />
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Staff Role</label>
                    <select
                      value={employeeForm.role}
                      onChange={(e) => setEmployeeForm(prev => ({ ...prev, role: e.target.value }))}
                      className="px-3 py-2 text-xs border bg-white border-slate-350 rounded-input focus:outline-none dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200"
                    >
                      <option value="waiter">Waiter / Waitress</option>
                      <option value="chef">Chef / Kitchen cook</option>
                      <option value="cashier">Cashier</option>
                      <option value="manager">Manager</option>
                      <option value="cleaner">Cleaner</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <Input 
                    label="Salary / Rate ($/hr)" 
                    type="number"
                    value={employeeForm.salary} 
                    onChange={(e) => setEmployeeForm(prev => ({ ...prev, salary: parseFloat(e.target.value) || 0 }))}
                    required 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    label="Shift Start" 
                    placeholder="e.g. 09:00"
                    value={employeeForm.shift.start} 
                    onChange={(e) => setEmployeeForm(prev => ({ ...prev, shift: { ...prev.shift, start: e.target.value } }))}
                  />
                  <Input 
                    label="Shift End" 
                    placeholder="e.g. 17:00"
                    value={employeeForm.shift.end} 
                    onChange={(e) => setEmployeeForm(prev => ({ ...prev, shift: { ...prev.shift, end: e.target.value } }))}
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => setShowAddEmployee(false)}>Cancel</Button>
                  <Button type="submit" variant="primary" size="sm">Register Staff</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EmployeesPage;
