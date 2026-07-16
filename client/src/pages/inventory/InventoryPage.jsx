import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addToast } from '../../redux/slices/ui.slice';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Skeleton from '../../components/ui/Skeleton';
import api from '../../services/api';
import {
  Package, Plus, Search, AlertTriangle, Truck, History,
  Trash2, Edit2, TrendingDown, TrendingUp, X, ChevronRight
} from 'lucide-react';

const CATEGORY_COLORS = {
  ingredient: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
  beverage:   'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
  supply:     'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400',
  equipment:  'bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400',
  other:      'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400',
};

const TAX_TYPES = ['purchase', 'consumption', 'waste', 'adjustment'];

export const InventoryPage = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('items');
  const [loading, setLoading] = useState(false);

  // Items state
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [alerts, setAlerts] = useState([]);

  // Suppliers state
  const [suppliers, setSuppliers] = useState([]);

  // Transactions state
  const [transactions, setTransactions] = useState([]);

  // Modals
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [showStockModal, setShowStockModal] = useState(null); // item object

  // Forms
  const [itemForm, setItemForm] = useState({ name: '', sku: '', category: 'ingredient', unit: 'kg', currentStock: 0, minimumStock: 0, costPerUnit: 0 });
  const [supplierForm, setSupplierForm] = useState({ name: '', contactName: '', phone: '', email: '', address: '' });
  const [stockForm, setStockForm] = useState({ type: 'purchase', quantity: 0, notes: '' });

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => { if (activeTab === 'items') fetchItems(); }, [search, categoryFilter]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchItems(), fetchSuppliers(), fetchTransactions(), fetchAlerts()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (categoryFilter) params.set('category', categoryFilter);
      const res = await api.get(`/inventory/items?${params}`);
      setItems(res.data.data.items);
    } catch { /* silent */ }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await api.get('/inventory/suppliers');
      setSuppliers(res.data.data.suppliers);
    } catch { /* silent */ }
  };

  const fetchTransactions = async () => {
    try {
      const res = await api.get('/inventory/transactions?limit=50');
      setTransactions(res.data.data.items);
    } catch { /* silent */ }
  };

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/inventory/alerts');
      setAlerts(res.data.data.alerts);
    } catch { /* silent */ }
  };

  // ── Item CRUD ─────────────────────────────────────────────────────────────
  const handleCreateItem = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/inventory/items', itemForm);
      setItems(prev => [res.data.data.item, ...prev]);
      setItemForm({ name: '', sku: '', category: 'ingredient', unit: 'kg', currentStock: 0, minimumStock: 0, costPerUnit: 0 });
      setShowAddItem(false);
      dispatch(addToast({ message: 'Inventory item created', type: 'success' }));
    } catch {
      dispatch(addToast({ message: 'Failed to create item', type: 'error' }));
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Delete this inventory item?')) return;
    try {
      await api.delete(`/inventory/items/${id}`);
      setItems(prev => prev.filter(i => i._id !== id));
      dispatch(addToast({ message: 'Item deleted', type: 'info' }));
    } catch {
      dispatch(addToast({ message: 'Failed to delete item', type: 'error' }));
    }
  };

  // ── Supplier CRUD ─────────────────────────────────────────────────────────
  const handleCreateSupplier = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/inventory/suppliers', supplierForm);
      setSuppliers(prev => [...prev, res.data.data.supplier]);
      setSupplierForm({ name: '', contactName: '', phone: '', email: '', address: '' });
      setShowAddSupplier(false);
      dispatch(addToast({ message: 'Supplier added', type: 'success' }));
    } catch {
      dispatch(addToast({ message: 'Failed to add supplier', type: 'error' }));
    }
  };

  const handleDeleteSupplier = async (id) => {
    if (!window.confirm('Delete this supplier?')) return;
    try {
      await api.delete(`/inventory/suppliers/${id}`);
      setSuppliers(prev => prev.filter(s => s._id !== id));
      dispatch(addToast({ message: 'Supplier deleted', type: 'info' }));
    } catch {
      dispatch(addToast({ message: 'Failed to delete supplier', type: 'error' }));
    }
  };

  // ── Stock Adjustment ──────────────────────────────────────────────────────
  const handleAdjustStock = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/inventory/items/${showStockModal._id}/stock`, stockForm);
      const updatedItem = res.data.data.item;
      setItems(prev => prev.map(i => i._id === updatedItem._id ? updatedItem : i));
      if (updatedItem.currentStock <= updatedItem.minimumStock) {
        await fetchAlerts();
      }
      setShowStockModal(null);
      setStockForm({ type: 'purchase', quantity: 0, notes: '' });
      dispatch(addToast({ message: `Stock ${stockForm.type} recorded`, type: 'success' }));
    } catch {
      dispatch(addToast({ message: 'Failed to adjust stock', type: 'error' }));
    }
  };

  // ── Stock Bar Helpers ─────────────────────────────────────────────────────
  const getStockPct = (item) => {
    const max = Math.max(item.minimumStock * 4, item.currentStock, 1);
    return Math.min(100, (item.currentStock / max) * 100);
  };

  const getStockColor = (item) => {
    if (item.currentStock <= item.minimumStock) return 'bg-red-500';
    if (item.currentStock <= item.minimumStock * 2) return 'bg-amber-400';
    return 'bg-emerald-500';
  };

  const tabs = [
    { id: 'items', label: 'Stock Items', icon: Package },
    { id: 'suppliers', label: 'Suppliers', icon: Truck },
    { id: 'transactions', label: 'Transactions', icon: History },
    { id: 'alerts', label: `Alerts${alerts.length ? ` (${alerts.length})` : ''}`, icon: AlertTriangle },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-zinc-50 flex items-center">
              <Package className="h-6 w-6 mr-2 text-primary" /> Inventory Management
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Track ingredients, beverages, and supplies. Monitor stock levels and manage suppliers.
            </p>
          </div>
          {activeTab === 'items' && (
            <Button variant="primary" icon={Plus} onClick={() => setShowAddItem(true)}>Add Item</Button>
          )}
          {activeTab === 'suppliers' && (
            <Button variant="primary" icon={Plus} onClick={() => setShowAddSupplier(true)}>Add Supplier</Button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-slate-100 dark:bg-zinc-900 p-1 rounded-card w-fit">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center px-4 py-2 text-xs font-semibold rounded-input transition-all ${
                activeTab === id
                  ? 'bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 shadow-soft'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700'
              } ${id === 'alerts' && alerts.length ? 'text-red-500' : ''}`}
            >
              <Icon className={`h-3.5 w-3.5 mr-1.5 ${id === 'alerts' && alerts.length ? 'text-red-500' : ''}`} />
              {label}
            </button>
          ))}
        </div>

        {/* ── ITEMS TAB ──────────────────────────────────────────────────── */}
        {activeTab === 'items' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center bg-white border border-slate-200 dark:bg-zinc-900 dark:border-zinc-800 px-3 py-2 rounded-card shadow-soft flex-1 max-w-xs">
                <Search className="h-4 w-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="text" placeholder="Search items..."
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full text-xs bg-transparent focus:outline-none text-slate-800 dark:text-zinc-200"
                />
              </div>
              <div className="flex space-x-1.5 overflow-x-auto">
                {['', 'ingredient', 'beverage', 'supply', 'equipment'].map(cat => (
                  <button key={cat} onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-pill transition-colors whitespace-nowrap ${
                      categoryFilter === cat ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}>
                    {cat ? cat.charAt(0).toUpperCase() + cat.slice(1) : 'All'}
                  </button>
                ))}
              </div>
            </div>

            {/* Items Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => <Skeleton key={i} variant="rectangular" height={160} />)}
              </div>
            ) : items.length === 0 ? (
              <Card className="text-center py-12 border-dashed border-2 border-slate-200 dark:border-zinc-800">
                <Package className="h-8 w-8 text-slate-300 dark:text-zinc-700 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-400">No inventory items found.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {items.map(item => {
                  const isLow = item.currentStock <= item.minimumStock;
                  return (
                    <Card key={item._id} className={`p-4 flex flex-col space-y-3 border transition-all hover:shadow-premium ${isLow ? 'border-red-300/50 dark:border-red-800/40' : 'border-slate-100 dark:border-zinc-900'}`}>
                      {/* Top row */}
                      <div className="flex justify-between items-start">
                        <div className="space-y-0.5 flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-100 truncate">{item.name}</h4>
                          <p className="text-[10px] text-slate-400 font-semibold">{item.sku || '—'}</p>
                        </div>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-pill ml-2 shrink-0 ${CATEGORY_COLORS[item.category]}`}>
                          {item.category}
                        </span>
                      </div>

                      {/* Stock bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-semibold">
                          <span className={isLow ? 'text-red-500' : 'text-slate-500 dark:text-zinc-400'}>
                            {isLow && '⚠ '}Stock: {item.currentStock} {item.unit}
                          </span>
                          <span className="text-slate-400">Min: {item.minimumStock}</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${getStockColor(item)}`}
                            style={{ width: `${getStockPct(item)}%` }}
                          />
                        </div>
                      </div>

                      {/* Cost & Supplier */}
                      <div className="text-[10px] text-slate-400 dark:text-zinc-500 space-y-0.5">
                        <div className="flex justify-between">
                          <span>Cost/Unit</span>
                          <span className="font-semibold text-slate-600 dark:text-zinc-300">${item.costPerUnit.toFixed(2)}</span>
                        </div>
                        {item.supplierId && (
                          <div className="flex justify-between">
                            <span>Supplier</span>
                            <span className="font-semibold text-slate-600 dark:text-zinc-300 truncate max-w-[120px]">{item.supplierId.name}</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2 pt-1 border-t border-slate-50 dark:border-zinc-900/50">
                        <Button
                          onClick={() => { setShowStockModal(item); setStockForm({ type: 'purchase', quantity: 0, notes: '' }); }}
                          variant="outline" size="sm" className="flex-1 text-[10px] py-1"
                        >
                          Adjust Stock
                        </Button>
                        <button onClick={() => handleDeleteItem(item._id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── SUPPLIERS TAB ───────────────────────────────────────────────── */}
        {activeTab === 'suppliers' && (
          <Card className="p-0 overflow-hidden border border-slate-100 dark:border-zinc-900">
            {showAddSupplier && (
              <form onSubmit={handleCreateSupplier} className="p-6 border-b border-slate-100 dark:border-zinc-900 bg-slate-50/50 dark:bg-zinc-900/30 space-y-4">
                <h4 className="text-xs font-bold text-slate-700 dark:text-zinc-200">Add New Supplier</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Company Name" value={supplierForm.name} onChange={e => setSupplierForm(p => ({ ...p, name: e.target.value }))} required />
                  <Input label="Contact Name" value={supplierForm.contactName} onChange={e => setSupplierForm(p => ({ ...p, contactName: e.target.value }))} />
                  <Input label="Phone" value={supplierForm.phone} onChange={e => setSupplierForm(p => ({ ...p, phone: e.target.value }))} />
                  <Input label="Email" type="email" value={supplierForm.email} onChange={e => setSupplierForm(p => ({ ...p, email: e.target.value }))} />
                  <Input label="Address" value={supplierForm.address} onChange={e => setSupplierForm(p => ({ ...p, address: e.target.value }))} />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setShowAddSupplier(false)}>Cancel</Button>
                  <Button type="submit" variant="primary" size="sm">Save Supplier</Button>
                </div>
              </form>
            )}
            {suppliers.length === 0 ? (
              <div className="py-12 text-center">
                <Truck className="h-8 w-8 text-slate-300 dark:text-zinc-700 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-400">No suppliers added yet.</p>
              </div>
            ) : (
              <table className="min-w-full text-xs text-left">
                <thead className="bg-slate-50/50 dark:bg-zinc-900/30 text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400">
                  <tr>
                    <th className="p-4">Company</th>
                    <th className="p-4">Contact</th>
                    <th className="p-4">Phone</th>
                    <th className="p-4">Email</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-zinc-900/50">
                  {suppliers.map(s => (
                    <tr key={s._id} className="hover:bg-slate-50/30 dark:hover:bg-zinc-900/20">
                      <td className="p-4 font-bold text-slate-800 dark:text-zinc-200">{s.name}</td>
                      <td className="p-4 text-slate-500">{s.contactName || '—'}</td>
                      <td className="p-4 text-slate-500">{s.phone || '—'}</td>
                      <td className="p-4 text-slate-500">{s.email || '—'}</td>
                      <td className="p-4 text-right">
                        <button onClick={() => handleDeleteSupplier(s._id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        )}

        {/* ── TRANSACTIONS TAB ─────────────────────────────────────────────── */}
        {activeTab === 'transactions' && (
          <Card className="p-0 overflow-hidden border border-slate-100 dark:border-zinc-900">
            {transactions.length === 0 ? (
              <div className="py-12 text-center">
                <History className="h-8 w-8 text-slate-300 dark:text-zinc-700 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-400">No stock movements recorded yet.</p>
              </div>
            ) : (
              <table className="min-w-full text-xs text-left">
                <thead className="bg-slate-50/50 dark:bg-zinc-900/30 text-[10px] uppercase font-bold text-slate-500">
                  <tr>
                    <th className="p-4">Item</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Quantity</th>
                    <th className="p-4">Notes</th>
                    <th className="p-4">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-zinc-900/50">
                  {transactions.map(tx => (
                    <tr key={tx._id} className="hover:bg-slate-50/30 dark:hover:bg-zinc-900/20">
                      <td className="p-4 font-bold text-slate-800 dark:text-zinc-200">
                        {tx.itemId?.name || '—'} <span className="text-slate-400 font-normal">({tx.itemId?.unit})</span>
                      </td>
                      <td className="p-4">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-pill ${
                          tx.type === 'purchase' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/20' :
                          tx.type === 'waste' ? 'bg-red-100 text-red-600 dark:bg-red-950/20' :
                          tx.type === 'consumption' ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/20' :
                          'bg-blue-100 text-blue-600 dark:bg-blue-950/20'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className={`p-4 font-bold ${tx.quantity >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {tx.quantity >= 0 ? '+' : ''}{tx.quantity}
                      </td>
                      <td className="p-4 text-slate-500">{tx.notes || '—'}</td>
                      <td className="p-4 text-[10px] text-slate-400">{new Date(tx.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        )}

        {/* ── ALERTS TAB ──────────────────────────────────────────────────── */}
        {activeTab === 'alerts' && (
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <Card className="py-12 text-center border-dashed border-2 border-emerald-200 dark:border-emerald-900">
                <div className="text-4xl mb-2">✅</div>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">All stock levels are healthy!</p>
                <p className="text-xs text-slate-400 mt-1">No items below minimum threshold.</p>
              </Card>
            ) : (
              alerts.map(item => (
                <Card key={item._id} className="p-4 border border-red-200/60 dark:border-red-800/30 bg-red-50/40 dark:bg-red-950/10 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center shrink-0">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-zinc-200">{item.name}</p>
                      <p className="text-[10px] text-red-500 font-semibold">
                        Current: {item.currentStock} {item.unit} — Minimum: {item.minimumStock} {item.unit}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400"
                    onClick={() => { setShowStockModal(item); setStockForm({ type: 'purchase', quantity: 0, notes: '' }); setActiveTab('items'); }}
                    icon={TrendingUp}
                  >
                    Restock
                  </Button>
                </Card>
              ))
            )}
          </div>
        )}
      </div>

      {/* ── ADD ITEM MODAL ───────────────────────────────────────────────── */}
      {showAddItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-950 border border-slate-100 dark:border-zinc-900 w-full max-w-md rounded-card p-6 shadow-premium space-y-4 animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100">Add Inventory Item</h3>
              <button onClick={() => setShowAddItem(false)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            <form onSubmit={handleCreateItem} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Item Name" value={itemForm.name} onChange={e => setItemForm(p => ({ ...p, name: e.target.value }))} required />
                <Input label="SKU Code" value={itemForm.sku} onChange={e => setItemForm(p => ({ ...p, sku: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Category</label>
                  <select value={itemForm.category} onChange={e => setItemForm(p => ({ ...p, category: e.target.value }))}
                    className="px-3 py-2 text-xs border border-slate-300 bg-white rounded-input focus:outline-none focus:ring-1 focus:ring-primary dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200">
                    {['ingredient','beverage','supply','equipment','other'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <Input label="Unit (kg, liter, piece…)" value={itemForm.unit} onChange={e => setItemForm(p => ({ ...p, unit: e.target.value }))} required />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Input label="Current Stock" type="number" value={itemForm.currentStock} onChange={e => setItemForm(p => ({ ...p, currentStock: parseFloat(e.target.value) || 0 }))} />
                <Input label="Min. Stock" type="number" value={itemForm.minimumStock} onChange={e => setItemForm(p => ({ ...p, minimumStock: parseFloat(e.target.value) || 0 }))} />
                <Input label="Cost/Unit ($)" type="number" step="0.01" value={itemForm.costPerUnit} onChange={e => setItemForm(p => ({ ...p, costPerUnit: parseFloat(e.target.value) || 0 }))} />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" size="sm" onClick={() => setShowAddItem(false)}>Cancel</Button>
                <Button type="submit" variant="primary" size="sm">Save Item</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── STOCK ADJUST MODAL ───────────────────────────────────────────── */}
      {showStockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-950 border border-slate-100 dark:border-zinc-900 w-full max-w-sm rounded-card p-6 shadow-premium space-y-4 animate-scale-in">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100">Adjust Stock</h3>
                <p className="text-[10px] text-slate-400">{showStockModal.name} — Current: {showStockModal.currentStock} {showStockModal.unit}</p>
              </div>
              <button onClick={() => setShowStockModal(null)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            <form onSubmit={handleAdjustStock} className="space-y-4">
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Transaction Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {TAX_TYPES.map(t => (
                    <button key={t} type="button" onClick={() => setStockForm(p => ({ ...p, type: t }))}
                      className={`py-2 text-xs font-semibold rounded-input border transition-all capitalize ${
                        stockForm.type === t ? 'bg-primary/10 border-primary text-primary' : 'border-slate-200 text-slate-500 dark:border-zinc-800'
                      }`}>
                      {t === 'purchase' ? '↑ Purchase' : t === 'consumption' ? '↓ Used' : t === 'waste' ? '⊘ Waste' : '⇄ Adjust'}
                    </button>
                  ))}
                </div>
              </div>
              <Input
                label={`Quantity (${showStockModal.unit})`}
                type="number" step="0.01" min="0"
                value={stockForm.quantity}
                onChange={e => setStockForm(p => ({ ...p, quantity: parseFloat(e.target.value) || 0 }))}
                required
              />
              <Input
                label="Notes (optional)"
                value={stockForm.notes}
                onChange={e => setStockForm(p => ({ ...p, notes: e.target.value }))}
              />
              <div className="flex justify-end space-x-2">
                <Button variant="outline" size="sm" onClick={() => setShowStockModal(null)}>Cancel</Button>
                <Button type="submit" variant="primary" size="sm">Record Movement</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default InventoryPage;
