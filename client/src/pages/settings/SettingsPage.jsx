import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addToast } from '../../redux/slices/ui.slice';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import api from '../../services/api';
import { Settings, Save, Sliders, Shield, Printer, Bell, MapPin, Plus, Trash2, Eye } from 'lucide-react';

export const SettingsPage = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('general');
  const [profile, setProfile] = useState({ name: '', phone: '', email: '', address: '', taxInfo: { rate: 10, vatNumber: '' }, currency: 'USD' });
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);

  // Notifications audit logs and mock test controls
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [testForm, setTestForm] = useState({ channel: 'email', recipient: '', type: 'receipt' });
  const [testLoading, setTestLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // New Branch Form State
  const [newBranch, setNewBranch] = useState({ name: '', phone: '', email: '', address: '' });
  const [showAddBranch, setShowAddBranch] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const profileRes = await api.get('/restaurant');
      setProfile(profileRes.data.data.profile);

      const branchRes = await api.get('/restaurant/branches');
      setBranches(branchRes.data.data.branches);
    } catch (err) {
      dispatch(addToast({ message: 'Error loading settings data', type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patch('/restaurant', profile);
      dispatch(addToast({ message: 'Restaurant profile updated successfully', type: 'success' }));
    } catch (err) {
      dispatch(addToast({ message: 'Failed to update profile', type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  const handleAddBranch = async (e) => {
    e.preventDefault();
    if (!newBranch.name.trim()) return;
    setLoading(true);
    try {
      const res = await api.post('/restaurant/branches', newBranch);
      setBranches(prev => [...prev, res.data.data.branch]);
      setNewBranch({ name: '', phone: '', email: '', address: '' });
      setShowAddBranch(false);
      dispatch(addToast({ message: 'New location branch added successfully', type: 'success' }));
    } catch (err) {
      dispatch(addToast({ message: 'Failed to add branch location', type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBranch = async (branchId) => {
    if (!window.confirm('Are you sure you want to delete this branch location?')) return;
    setLoading(true);
    try {
      await api.delete(`/restaurant/branches/${branchId}`);
      setBranches(prev => prev.filter(b => b._id !== branchId));
      dispatch(addToast({ message: 'Branch location deleted successfully', type: 'info' }));
    } catch (err) {
      dispatch(addToast({ message: 'Failed to delete branch location', type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async (pageNumber = 1) => {
    setLogsLoading(true);
    try {
      const res = await api.get(`/notifications/logs?page=${pageNumber}&limit=8`);
      setLogs(res.data.data.items);
      setTotalPages(res.data.data.totalPages);
      setPage(res.data.data.page);
    } catch (err) {
      dispatch(addToast({ message: 'Failed to fetch notification logs', type: 'error' }));
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'notifications') {
      fetchLogs(1);
    }
  }, [activeTab]);

  const handleChannelChange = (channel) => {
    setTestForm({
      channel,
      recipient: '',
      type: channel === 'email' ? 'receipt' : 'booking_confirmed'
    });
  };

  const handleSendTest = async (e) => {
    e.preventDefault();
    if (!testForm.recipient.trim()) return;
    setTestLoading(true);
    try {
      await api.post('/notifications/test', testForm);
      dispatch(addToast({ message: `Test ${testForm.channel} alert triggered successfully`, type: 'success' }));
      fetchLogs(1);
    } catch (err) {
      dispatch(addToast({ message: 'Failed to trigger test notification', type: 'error' }));
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-zinc-50">
            System Settings
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Configure system rules, multi-location branches, printer formats, and appearance variables.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Navigation tabs column */}
          <Card className="p-3 space-y-1 lg:col-span-1 h-fit">
            <button 
              onClick={() => setActiveTab('general')}
              className={`flex items-center w-full px-3 py-2 text-xs font-semibold rounded-input transition-colors ${
                activeTab === 'general' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50 dark:text-zinc-400 dark:hover:bg-zinc-900'
              }`}
            >
              <Sliders className="h-4 w-4 mr-2.5" /> General Business
            </button>
            <button 
              onClick={() => setActiveTab('branches')}
              className={`flex items-center w-full px-3 py-2 text-xs font-semibold rounded-input transition-colors ${
                activeTab === 'branches' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50 dark:text-zinc-400 dark:hover:bg-zinc-900'
              }`}
            >
              <MapPin className="h-4 w-4 mr-2.5" /> Branches Management
            </button>
            <button 
              onClick={() => setActiveTab('printers')}
              className={`flex items-center w-full px-3 py-2 text-xs font-semibold rounded-input transition-colors ${
                activeTab === 'printers' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50 dark:text-zinc-400 dark:hover:bg-zinc-900'
              }`}
            >
              <Printer className="h-4 w-4 mr-2.5" /> Receipt Printers
            </button>
            <button 
              onClick={() => setActiveTab('security')}
              className={`flex items-center w-full px-3 py-2 text-xs font-semibold rounded-input transition-colors ${
                activeTab === 'security' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50 dark:text-zinc-400 dark:hover:bg-zinc-900'
              }`}
            >
              <Shield className="h-4 w-4 mr-2.5" /> Security & Keys
            </button>
            <button 
              onClick={() => setActiveTab('notifications')}
              className={`flex items-center w-full px-3 py-2 text-xs font-semibold rounded-input transition-colors ${
                activeTab === 'notifications' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50 dark:text-zinc-400 dark:hover:bg-zinc-900'
              }`}
            >
              <Bell className="h-4 w-4 mr-2.5" /> Notification Alerts
            </button>
          </Card>

          {/* Form details column */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* General Profile Tab */}
            {activeTab === 'general' && (
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <Card className="space-y-4">
                  <div className="pb-3 border-b border-slate-100 dark:border-zinc-800">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200">General Profile</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input 
                      label="Restaurant Name" 
                      name="name" 
                      value={profile.name} 
                      onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                    <Input 
                      label="Contact Phone" 
                      name="phone" 
                      value={profile.phone} 
                      onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                    />
                    <Input 
                      label="Contact Email" 
                      name="email" 
                      value={profile.email} 
                      onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                    />
                    <Input 
                      label="Currency Symbol" 
                      name="currency" 
                      value={profile.currency} 
                      onChange={(e) => setProfile(prev => ({ ...prev, currency: e.target.value }))}
                    />
                    <Input 
                      label="VAT Tax Rate (%)" 
                      name="vatRate" 
                      type="number"
                      value={profile.taxInfo?.rate} 
                      onChange={(e) => setProfile(prev => ({ ...prev, taxInfo: { ...prev.taxInfo, rate: parseFloat(e.target.value) } }))}
                    />
                    <Input 
                      label="VAT Number" 
                      name="vatNum" 
                      value={profile.taxInfo?.vatNumber} 
                      onChange={(e) => setProfile(prev => ({ ...prev, taxInfo: { ...prev.taxInfo, vatNumber: e.target.value } }))}
                    />
                  </div>
                  <Input 
                    label="Address" 
                    name="address" 
                    value={profile.address} 
                    onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
                  />
                </Card>

                <div className="flex justify-end">
                  <Button type="submit" variant="primary" loading={loading} icon={Save}>
                    Save Profile
                  </Button>
                </div>
              </form>
            )}

            {/* Branches Tab */}
            {activeTab === 'branches' && (
              <Card className="space-y-6">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-zinc-800">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200">Branches Management</h3>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold">Define locations for franchise layouts</p>
                  </div>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    icon={Plus}
                    onClick={() => setShowAddBranch(!showAddBranch)}
                  >
                    Add Location
                  </Button>
                </div>

                {/* Add Branch Drawer Form */}
                {showAddBranch && (
                  <form onSubmit={handleAddBranch} className="p-4 border border-primary/20 bg-slate-50/50 dark:bg-zinc-900/30 rounded-card space-y-4 animate-scale-in">
                    <h4 className="text-xs font-bold text-slate-700 dark:text-zinc-300">Add New Branch Location</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input 
                        label="Branch Name" 
                        placeholder="e.g. London East" 
                        value={newBranch.name}
                        onChange={(e) => setNewBranch(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                      <Input 
                        label="Phone" 
                        placeholder="+44 20 ..." 
                        value={newBranch.phone}
                        onChange={(e) => setNewBranch(prev => ({ ...prev, phone: e.target.value }))}
                      />
                      <Input 
                        label="Email" 
                        type="email"
                        placeholder="east@restaurant.com" 
                        value={newBranch.email}
                        onChange={(e) => setNewBranch(prev => ({ ...prev, email: e.target.value }))}
                      />
                      <Input 
                        label="Address" 
                        placeholder="123 Road St" 
                        value={newBranch.address}
                        onChange={(e) => setNewBranch(prev => ({ ...prev, address: e.target.value }))}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm" onClick={() => setShowAddBranch(false)}>Cancel</Button>
                      <Button type="submit" variant="primary" size="sm" loading={loading}>Save Branch</Button>
                    </div>
                  </form>
                )}

                {/* List of Branches */}
                <div className="space-y-4">
                  {branches.length === 0 ? (
                    <p className="text-xs text-slate-400 dark:text-zinc-500 text-center py-4 font-semibold">No branches configured yet.</p>
                  ) : (
                    branches.map((b) => (
                      <div key={b._id} className="flex justify-between items-center p-4 border border-slate-100 dark:border-zinc-800 rounded-card bg-white dark:bg-zinc-900/40 hover:shadow-soft transition-all">
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200">{b.name}</h4>
                          <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold">{b.address || 'No address'}</p>
                          <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-pill ${
                            b.isActive ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-500' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {b.isActive ? 'Active' : 'Offline'}
                          </span>
                        </div>
                        <Button 
                          variant="text" 
                          size="sm" 
                          className="text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/20"
                          onClick={() => handleDeleteBranch(b._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            )}

            {/* Printers & Security mocks */}
            {activeTab === 'printers' && (
              <Card className="space-y-4">
                <div className="pb-3 border-b border-slate-100 dark:border-zinc-800">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200">Receipt Printers Settings</h3>
                </div>
                <p className="text-xs text-slate-400 dark:text-zinc-500">Configure ticket printers (USB/Network/Bluetooth) for kitchen tickets and cashier POS invoices.</p>
              </Card>
            )}

            {activeTab === 'security' && (
              <Card className="space-y-4">
                <div className="pb-3 border-b border-slate-100 dark:border-zinc-800">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200">Security Parameters</h3>
                </div>
                <p className="text-xs text-slate-400 dark:text-zinc-500">Set API secrets, session length limits, password expiration intervals.</p>
              </Card>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                {/* Integration Snapshot */}
                <Card className="space-y-4">
                  <div className="pb-3 border-b border-slate-100 dark:border-zinc-800">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200">Integration Configuration</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 bg-slate-50 dark:bg-zinc-900/50 rounded-card border border-slate-100 dark:border-zinc-800/50 space-y-2">
                      <p className="font-bold text-slate-700 dark:text-zinc-300">SMTP Email Node</p>
                      <p className="text-[10px] text-slate-400 dark:text-zinc-500">Auto-configured via .env keys. If empty or invalid, the mailer gracefully logs HTML templates to the console.</p>
                      <span className="inline-block text-[9px] font-bold bg-blue-100 text-blue-600 dark:bg-blue-950/20 dark:text-blue-500 px-1.5 py-0.5 rounded-pill">SMTP Console Fallback Active</span>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-zinc-900/50 rounded-card border border-slate-100 dark:border-zinc-800/50 space-y-2">
                      <p className="font-bold text-slate-700 dark:text-zinc-300">SMS Gateway API</p>
                      <p className="text-[10px] text-slate-400 dark:text-zinc-500">Supports Twilio sending. If credentials are unset, the system defaults to printing SMS message blocks to standard output.</p>
                      <span className="inline-block text-[9px] font-bold bg-amber-100 text-amber-600 dark:bg-amber-950/20 dark:text-amber-500 px-1.5 py-0.5 rounded-pill">Twilio Mock Engine Active</span>
                    </div>
                  </div>
                </Card>

                {/* Send Test Alert Form */}
                <Card className="space-y-4">
                  <div className="pb-3 border-b border-slate-100 dark:border-zinc-800">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200">Trigger Test Notification</h3>
                  </div>
                  <form onSubmit={handleSendTest} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                    <div className="space-y-1 sm:col-span-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Channel</label>
                      <select 
                        value={testForm.channel} 
                        onChange={(e) => handleChannelChange(e.target.value)}
                        className="w-full text-xs border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-input px-3 py-2 text-slate-700 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="email">Email</option>
                        <option value="sms">SMS</option>
                      </select>
                    </div>
                    
                    <div className="space-y-1 sm:col-span-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Alert Type</label>
                      <select 
                        value={testForm.type} 
                        onChange={(e) => setTestForm(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full text-xs border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-input px-3 py-2 text-slate-700 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        {testForm.channel === 'email' ? (
                          <>
                            <option value="receipt">Order Receipt Invoice</option>
                            <option value="booking_confirmed">Reservation Confirmed</option>
                          </>
                        ) : (
                          <>
                            <option value="booking_confirmed">Reservation Confirmed</option>
                            <option value="booking_seated">Table Seated Alert</option>
                          </>
                        )}
                      </select>
                    </div>

                    <div className="space-y-1 sm:col-span-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                        {testForm.channel === 'email' ? 'Recipient Email' : 'Recipient Phone'}
                      </label>
                      <input 
                        type="text"
                        placeholder={testForm.channel === 'email' ? 'e.g. test@example.com' : 'e.g. +447911123456'}
                        value={testForm.recipient}
                        onChange={(e) => setTestForm(prev => ({ ...prev, recipient: e.target.value }))}
                        required
                        className="w-full text-xs border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-input px-3 py-2 text-slate-700 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <div className="sm:col-span-1">
                      <Button type="submit" variant="primary" loading={testLoading} className="w-full py-2.5">
                        Send Test Alert
                      </Button>
                    </div>
                  </form>
                </Card>

                {/* Audit Logs Table */}
                <Card className="space-y-4">
                  <div className="pb-3 border-b border-slate-100 dark:border-zinc-800">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200">Alert Audit History</h3>
                  </div>
                  <div className="overflow-x-auto">
                    {logsLoading ? (
                      <div className="space-y-3 py-4">
                        <div className="h-6 bg-slate-100 dark:bg-zinc-800 rounded animate-pulse" />
                        <div className="h-6 bg-slate-100 dark:bg-zinc-800 rounded animate-pulse" />
                      </div>
                    ) : logs.length === 0 ? (
                      <p className="text-xs text-slate-400 dark:text-zinc-500 text-center py-4 font-semibold">No notification logs recorded yet.</p>
                    ) : (
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 dark:border-zinc-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            <th className="py-2.5">Channel</th>
                            <th className="py-2.5">Recipient</th>
                            <th className="py-2.5">Alert Type</th>
                            <th className="py-2.5">Status</th>
                            <th className="py-2.5 text-right">Sent Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {logs.map((log) => (
                            <tr key={log._id} className="border-b border-slate-50 dark:border-zinc-900/50 last:border-0 hover:bg-slate-50/30 dark:hover:bg-zinc-900/10">
                              <td className="py-3 capitalize">
                                <span className={`inline-block px-2 py-0.5 rounded-card font-bold text-[9px] ${
                                  log.channel === 'email' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400' : 'bg-pink-100 text-pink-600 dark:bg-pink-950/20 dark:text-pink-400'
                                }`}>
                                  {log.channel}
                                </span>
                              </td>
                              <td className="py-3 font-semibold text-slate-700 dark:text-zinc-300">{log.recipient}</td>
                              <td className="py-3 text-slate-500 dark:text-zinc-400 capitalize">{log.type.replace('_', ' ')}</td>
                              <td className="py-3">
                                <span className={`inline-block px-1.5 py-0.5 rounded-pill font-bold text-[9px] ${
                                  log.status === 'sent' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-500' : 
                                  log.status === 'logged' ? 'bg-blue-100 text-blue-600 dark:bg-blue-950/20 dark:text-blue-500' : 'bg-red-100 text-red-650'
                                }`}>
                                  {log.status}
                                </span>
                              </td>
                              <td className="py-3 text-right text-slate-400">{new Date(log.createdAt).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-zinc-800">
                      <Button variant="outline" size="sm" disabled={page === 1} onClick={() => fetchLogs(page - 1)}>
                        Previous
                      </Button>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500">Page {page} of {totalPages}</span>
                      <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => fetchLogs(page + 1)}>
                        Next
                      </Button>
                    </div>
                  )}
                </Card>
              </div>
            )}

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
