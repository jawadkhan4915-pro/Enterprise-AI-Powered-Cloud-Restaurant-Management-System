import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addToast } from '../../redux/slices/ui.slice';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import api from '../../services/api';
import usePermission from '../../hooks/usePermission';
import { ShoppingCart, Search, Receipt, Trash2, Plus, Minus, Tag, Landmark, User, CreditCard } from 'lucide-react';

export const POSPage = () => {
  const dispatch = useDispatch();
  const { hasPermission } = usePermission();

  // Menu states
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchVal, setSearchVal] = useState('');

  // Cart states
  const [cart, setCart] = useState([]);
  const [orderType, setOrderType] = useState('dine_in');
  const [selectedTableId, setSelectedTableId] = useState('');
  const [tables, setTables] = useState([]);
  const [discountCode, setDiscountCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // Checkout modal
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPOSData();
  }, []);

  const fetchPOSData = async () => {
    try {
      const catRes = await api.get('/menu/categories');
      setCategories(catRes.data.data.categories);

      const itemsRes = await api.get('/menu/items');
      setMenuItems(itemsRes.data.data.items);

      // Load branches first
      const branchRes = await api.get('/restaurant/branches');
      const branchesList = branchRes.data.data.branches;
      if (branchesList.length > 0) {
        const branchId = branchesList[0]._id;
        // Load active floors for this branch
        const floorPlanRes = await api.get(`/restaurant/floors?branchId=${branchId}`);
        if (floorPlanRes.data.data.floors.length > 0) {
          const floorId = floorPlanRes.data.data.floors[0]._id;
          const tablesRes = await api.get(`/restaurant/tables?floorId=${floorId}`);
          setTables(tablesRes.data.data.tables.filter(t => t.status === 'available'));
        }
      }
    } catch (err) {
      dispatch(addToast({ message: 'Error retrieving POS terminals data', type: 'error' }));
    }
  };

  // Cart actions
  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.menuItemId === item._id);
      if (existing) {
        return prev.map((i) =>
          i.menuItemId === item._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          menuItemId: item._id,
          name: item.name,
          price: item.price,
          quantity: 1,
        },
      ];
    });
  };

  const updateQuantity = (itemId, amount) => {
    setCart((prev) =>
      prev
        .map((i) => (i.menuItemId === itemId ? { ...i, quantity: i.quantity + amount } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const removeFromCart = (itemId) => {
    setCart((prev) => prev.filter((i) => i.menuItemId !== itemId));
  };

  // Computations
  const subTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const taxRate = 10; // 10%
  const taxAmount = (subTotal * taxRate) / 100;
  const grandTotal = Math.max(0, subTotal + taxAmount - discountAmount);

  const applyPromo = () => {
    if (discountCode.toLowerCase() === 'welcome10') {
      setDiscountAmount(10);
      dispatch(addToast({ message: 'Promo code WELCOME10 applied ($10.00 off)', type: 'success' }));
    } else {
      dispatch(addToast({ message: 'Invalid promo code', type: 'warning' }));
    }
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      dispatch(addToast({ message: 'Cart is empty', type: 'warning' }));
      return;
    }
    if (orderType === 'dine_in' && !selectedTableId) {
      dispatch(addToast({ message: 'Please select a dining table', type: 'warning' }));
      return;
    }

    setLoading(true);
    try {
      const orderPayload = {
        orderType,
        tableId: orderType === 'dine_in' ? selectedTableId : null,
        items: cart,
        subTotal,
        discount: { code: discountCode, amount: discountAmount },
        tax: { rate: taxRate, amount: taxAmount },
        grandTotal,
        customerDetails: { name: customerName, phone: customerPhone },
      };

      const res = await api.post('/orders', orderPayload);
      const newOrder = res.data.data.order;

      // Reset cart
      setCart([]);
      setDiscountCode('');
      setDiscountAmount(0);
      setSelectedTableId('');
      setCustomerName('');
      setCustomerPhone('');

      dispatch(addToast({ message: `Order ${newOrder.orderNumber} placed successfully`, type: 'success' }));
    } catch (err) {
      dispatch(addToast({ message: 'Failed to place order ticket', type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  // Checkout and pay directly (POS instant checkout)
  const handleInstantCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setLoading(true);
    try {
      const orderPayload = {
        orderType,
        tableId: orderType === 'dine_in' ? selectedTableId : null,
        items: cart,
        subTotal,
        discount: { code: discountCode, amount: discountAmount },
        tax: { rate: taxRate, amount: taxAmount },
        grandTotal,
        customerDetails: { name: customerName, phone: customerPhone },
      };

      // 1. Create order
      const orderRes = await api.post('/orders', orderPayload);
      const orderId = orderRes.data.data.order._id;

      // 2. Pay order directly
      await api.post(`/orders/${orderId}/checkout`, {
        paymentMethod,
        discountAmount,
      });

      // Reset states
      setCart([]);
      setDiscountCode('');
      setDiscountAmount(0);
      setSelectedTableId('');
      setCustomerName('');
      setCustomerPhone('');
      setShowCheckout(false);

      dispatch(addToast({ message: 'Simulated payment checkout completed successfully!', type: 'success' }));
    } catch (err) {
      dispatch(addToast({ message: 'Checkout transaction failed', type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  // Filter items
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory ? (item.categoryId?._id === selectedCategory || item.categoryId === selectedCategory) : true;
    const matchesSearch = item.name.toLowerCase().includes(searchVal.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchVal.toLowerCase());
    return item.isAvailable && matchesCategory && matchesSearch;
  });

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-120px)] overflow-hidden">
        {/* Left Side: Items Selection (Cols 7) */}
        <div className="lg:col-span-7 flex flex-col h-full overflow-hidden space-y-4">
          {/* Top Bar: Search and categories */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center bg-white border border-slate-200 dark:bg-zinc-900 dark:border-zinc-800 px-3 py-2 rounded-card shadow-soft flex-1">
              <Search className="h-4 w-4 text-slate-400 mr-2" />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full text-xs bg-transparent focus:outline-none text-slate-800 dark:text-zinc-200"
              />
            </div>
            {/* Order type selectors */}
            <div className="flex bg-slate-100 dark:bg-zinc-900 p-1 rounded-card text-xs">
              {['dine_in', 'takeaway', 'delivery'].map((type) => (
                <button
                  key={type}
                  onClick={() => setOrderType(type)}
                  className={`px-3 py-1.5 font-semibold rounded-card transition-all capitalize ${
                    orderType === type ? 'bg-white text-slate-800 shadow-soft dark:bg-zinc-800 dark:text-zinc-50' : 'text-slate-500'
                  }`}
                >
                  {type.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Categories select row */}
          <div className="flex space-x-2 overflow-x-auto pb-1 shrink-0">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-pill transition-colors whitespace-nowrap ${
                selectedCategory === null ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-slate-200'
              }`}
            >
              All Items
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => setSelectedCategory(cat._id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-pill transition-colors whitespace-nowrap ${
                  selectedCategory === cat._id ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Items Grid View */}
          <div className="flex-1 overflow-y-auto pr-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <Card 
                  key={item._id} 
                  onClick={() => addToCart(item)}
                  className="p-3 border border-slate-100 dark:border-zinc-900 cursor-pointer hover:shadow-premium transition-all flex flex-col justify-between h-36"
                >
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200 truncate">{item.name}</h4>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 line-clamp-2 h-7 leading-normal">{item.description}</p>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs font-bold text-primary">${item.price.toFixed(2)}</span>
                    <span className="text-[9px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded-pill">Add</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Ticket Cart (Cols 5) */}
        <div className="lg:col-span-5 flex flex-col h-full overflow-hidden bg-white dark:bg-zinc-950 border border-slate-100 dark:border-zinc-900 rounded-card shadow-premium">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 dark:border-zinc-900 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-900/30">
            <span className="font-bold text-sm text-slate-800 dark:text-zinc-100 flex items-center">
              <Receipt className="h-4.5 w-4.5 mr-2 text-primary" /> Active Ticket
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">{cart.length} items</span>
          </div>

          {/* Table select & customer details */}
          <div className="p-4 border-b border-slate-100 dark:border-zinc-900 space-y-3 shrink-0">
            {orderType === 'dine_in' ? (
              <div className="flex flex-col space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Dining Table</label>
                <select
                  value={selectedTableId}
                  onChange={(e) => setSelectedTableId(e.target.value)}
                  className="px-3 py-2 text-xs border bg-white border-slate-200 rounded-input focus:outline-none dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200"
                >
                  <option value="">Select table</option>
                  {tables.map(t => (
                    <option key={t._id} value={t._id}>Table #{t.number} (Seats {t.capacity})</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Cust Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="px-3 py-2 text-xs border border-slate-200 rounded-input focus:outline-none dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200"
                />
                <input
                  type="text"
                  placeholder="Cust Phone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="px-3 py-2 text-xs border border-slate-200 rounded-input focus:outline-none dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200"
                />
              </div>
            )}
          </div>

          {/* Cart list scroll area */}
          <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-50 dark:divide-zinc-900/50">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <ShoppingCart className="h-10 w-10 mb-2" />
                <p className="text-xs font-semibold">Your cart is empty.</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.menuItemId} className="py-3 flex justify-between items-center first:pt-0">
                  <div className="space-y-0.5 max-w-[60%]">
                    <p className="text-xs font-bold text-slate-800 dark:text-zinc-200 truncate">{item.name}</p>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500">${item.price.toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    {/* Qty controls */}
                    <div className="flex items-center space-x-1.5 border border-slate-200 dark:border-zinc-800 rounded-card p-0.5">
                      <button onClick={() => updateQuantity(item.menuItemId, -1)} className="p-1 hover:bg-slate-100 rounded dark:hover:bg-zinc-800">
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.menuItemId, 1)} className="p-1 hover:bg-slate-100 rounded dark:hover:bg-zinc-800">
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <button onClick={() => removeFromCart(item.menuItemId)} className="text-red-400 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Calculation summary section */}
          <div className="p-4 border-t border-slate-100 dark:border-zinc-900 bg-slate-50/50 dark:bg-zinc-900/30 space-y-3.5 shrink-0">
            {/* Promo Code Input */}
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Promo Code (e.g. WELCOME10)"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-input bg-white text-slate-850 focus:outline-none dark:bg-zinc-900 dark:border-zinc-850 dark:text-zinc-200"
              />
              <Button onClick={applyPromo} variant="outline" size="sm" icon={Tag}>Apply</Button>
            </div>

            {/* Calculations lines */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>${subTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>VAT Tax ({taxRate}%)</span>
                <span>${taxAmount.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-500 font-bold">
                  <span>Discount</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm text-slate-800 dark:text-zinc-100 pt-2 border-t border-slate-200 dark:border-zinc-800">
                <span>Grand Total</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button 
                onClick={handlePlaceOrder} 
                variant="outline" 
                loading={loading}
                className={!hasPermission('manage_pos') ? 'col-span-2' : ''}
              >
                Send to Kitchen
              </Button>
              {hasPermission('manage_pos') && (
                <Button 
                  onClick={() => setShowCheckout(true)} 
                  variant="primary"
                  disabled={cart.length === 0}
                >
                  Pay & Checkout
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Checkout simulated payment modal */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-100 dark:bg-zinc-950 dark:border-zinc-900 w-full max-w-sm rounded-card p-6 shadow-premium space-y-4 animate-scale-in">
            <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100 flex items-center">
              <Landmark className="h-4.5 w-4.5 mr-2 text-primary" /> Invoice Payment Checkout
            </h3>
            
            <div className="space-y-3.5">
              <p className="text-xs text-slate-500 dark:text-zinc-400">Select payment method to complete checkout order ticket of **${grandTotal.toFixed(2)}**:</p>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-3 border rounded-card text-xs font-bold flex flex-col items-center justify-center transition-all ${
                    paymentMethod === 'cash' ? 'border-primary bg-primary/10 text-primary' : 'border-slate-200 text-slate-500'
                  }`}
                >
                  <Landmark className="h-5 w-5 mb-1" /> Cash
                </button>
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 border rounded-card text-xs font-bold flex flex-col items-center justify-center transition-all ${
                    paymentMethod === 'card' ? 'border-primary bg-primary/10 text-primary' : 'border-slate-200 text-slate-500'
                  }`}
                >
                  <CreditCard className="h-5 w-5 mb-1" /> Credit Card
                </button>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowCheckout(false)}>Cancel</Button>
              <Button onClick={handleInstantCheckout} variant="primary" size="sm" loading={loading}>Complete Checkout</Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default POSPage;
