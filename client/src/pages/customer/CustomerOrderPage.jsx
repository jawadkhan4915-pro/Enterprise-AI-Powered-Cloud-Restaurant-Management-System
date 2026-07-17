import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addToast } from '../../redux/slices/ui.slice';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import api from '../../services/api';
import { useSocket } from '../../contexts/SocketContext';
import { ShoppingCart, Search, Receipt, Trash2, Plus, Minus, Tag, Landmark, User, CreditCard, ShoppingBag, MapPin, Truck, Phone, CheckCircle, Clock, Check } from 'lucide-react';

export const CustomerOrderPage = () => {
  const dispatch = useDispatch();
  const socket = useSocket();

  // Tab state: 'menu' or 'tracker'
  const [activeTab, setActiveTab] = useState('menu');

  // Menu states
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchVal, setSearchVal] = useState('');

  // Cart states
  const [cart, setCart] = useState([]);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash'); // cash, card, online
  const [loading, setLoading] = useState(false);

  // Tracking states
  const [trackedOrders, setTrackedOrders] = useState([]);

  useEffect(() => {
    fetchMenuData();
    fetchActiveOrders();
    
    // Auto poll active orders tracking every 10 seconds for robust fallback
    const interval = setInterval(fetchActiveOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  // Listen to live socket events for real-time status updates
  useEffect(() => {
    if (!socket) return;
    
    socket.on('order_updated', (updated) => {
      if (updated.orderType === 'delivery') {
        fetchActiveOrders();
        dispatch(addToast({ 
          message: `🚚 Order ${updated.orderNumber} status updated to: ${updated.status.toUpperCase()}`, 
          type: 'info' 
        }));
      }
    });

    return () => {
      socket.off('order_updated');
    };
  }, [socket]);

  const fetchMenuData = async () => {
    try {
      const catRes = await api.get('/menu/categories');
      setCategories(catRes.data.data.categories);

      const itemsRes = await api.get('/menu/items');
      setMenuItems(itemsRes.data.data.items);
    } catch (err) {
      dispatch(addToast({ message: 'Error retrieving food menu items', type: 'error' }));
    }
  };

  const fetchActiveOrders = async () => {
    try {
      const res = await api.get('/orders?limit=50');
      // filter only active delivery orders
      const active = res.data.data.items.filter(
        (o) => o.orderType === 'delivery' && o.status !== 'completed' && o.status !== 'cancelled'
      );
      setTrackedOrders(active);
    } catch (err) {
      console.error('Error fetching tracked orders:', err);
    }
  };

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

  const subTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const taxRate = 10;
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

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      dispatch(addToast({ message: 'Your cart is empty', type: 'warning' }));
      return;
    }
    if (!deliveryAddress.trim()) {
      dispatch(addToast({ message: 'Please provide a delivery address', type: 'warning' }));
      return;
    }

    setLoading(true);
    try {
      const orderPayload = {
        orderType: 'delivery',
        deliveryAddress: deliveryAddress,
        items: cart,
        subTotal,
        discount: { code: discountCode, amount: discountAmount },
        tax: { rate: taxRate, amount: taxAmount },
        grandTotal,
        paymentMethod: paymentMethod === 'online' ? 'online' : paymentMethod,
        customerDetails: { name: 'Customer User', phone: '+44 7911 123456' },
      };

      const res = await api.post('/orders', orderPayload);
      const newOrder = res.data.data.order;

      if (paymentMethod === 'online') {
        await api.post(`/orders/${newOrder._id}/checkout`, {
          paymentMethod: 'online',
          discountAmount: discountAmount,
        });
        dispatch(addToast({ message: `Order ${newOrder.orderNumber} placed & paid online!`, type: 'success' }));
      } else {
        dispatch(addToast({ message: `Order ${newOrder.orderNumber} placed! Waiting for rider to call and confirm.`, type: 'success' }));
      }

      // Reset cart and switch to tracker
      setCart([]);
      setDiscountCode('');
      setDiscountAmount(0);
      setDeliveryAddress('');
      setPaymentMethod('cash');
      fetchActiveOrders();
      setActiveTab('tracker');
    } catch (err) {
      dispatch(addToast({ message: 'Failed to submit online order', type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory ? (item.categoryId?._id === selectedCategory || item.categoryId === selectedCategory) : true;
    const matchesSearch = item.name.toLowerCase().includes(searchVal.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchVal.toLowerCase());
    return item.isAvailable && matchesCategory && matchesSearch;
  });

  // Help solve progress matching statuses
  const getStatusStep = (status) => {
    switch (status) {
      case 'pending': return 1; // placed
      case 'preparing': return 3; // rider confirmed and sent to kitchen
      case 'ready': return 4; // ready for pickup
      case 'served': return 5; // out for delivery
      case 'completed': return 6; // delivered
      default: return 1;
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-120px)] overflow-hidden space-y-4">
        {/* Top Header tab selector */}
        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-zinc-900 shrink-0">
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-zinc-50 flex items-center">
              <Truck className="h-5 w-5 mr-2 text-primary" /> Delivery Food Ordering Portal
            </h1>
            <p className="text-xs text-slate-400">Delicious meals delivered direct to your door.</p>
          </div>
          <div className="flex bg-slate-100 dark:bg-zinc-900 p-1 rounded-card text-xs font-semibold">
            <button
              onClick={() => setActiveTab('menu')}
              className={`px-4 py-1.5 rounded-card transition-all ${
                activeTab === 'menu' ? 'bg-white text-slate-800 shadow-soft dark:bg-zinc-800 dark:text-zinc-50' : 'text-slate-500'
              }`}
            >
              Order Dishes
            </button>
            <button
              onClick={() => setActiveTab('tracker')}
              className={`px-4 py-1.5 rounded-card transition-all flex items-center gap-1 ${
                activeTab === 'tracker' ? 'bg-white text-slate-800 shadow-soft dark:bg-zinc-800 dark:text-zinc-50' : 'text-slate-500'
              }`}
            >
              Track Orders
              {trackedOrders.length > 0 && (
                <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
              )}
            </button>
          </div>
        </div>

        {/* Tab 1: Menu Grid */}
        {activeTab === 'menu' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden">
            {/* Left Side: Items Catalog */}
            <div className="lg:col-span-7 flex flex-col h-full overflow-hidden space-y-4">
              <div className="flex items-center bg-white border border-slate-200 dark:bg-zinc-900 dark:border-zinc-800 px-3 py-2 rounded-card shadow-soft shrink-0">
                <Search className="h-4 w-4 text-slate-400 mr-2" />
                <input
                  type="text"
                  placeholder="Search food menu items..."
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  className="w-full text-xs bg-transparent focus:outline-none text-slate-800 dark:text-zinc-200"
                />
              </div>

              {/* Categories row */}
              <div className="flex space-x-2 overflow-x-auto pb-1 shrink-0">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-pill transition-colors whitespace-nowrap ${
                    selectedCategory === null ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-slate-200'
                  }`}
                >
                  All Dishes
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

              {/* Catalog list */}
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
                        <span className="text-[9px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded-pill">Add to Basket</span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side: Cart Summary */}
            <div className="lg:col-span-5 flex flex-col h-full overflow-hidden bg-white dark:bg-zinc-950 border border-slate-100 dark:border-zinc-900 rounded-card shadow-premium">
              <div className="p-4 border-b border-slate-100 dark:border-zinc-900 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-900/30">
                <span className="font-bold text-sm text-slate-800 dark:text-zinc-100 flex items-center">
                  <ShoppingCart className="h-4.5 w-4.5 mr-2 text-primary" /> Delivery Basket
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">{cart.length} items</span>
              </div>

              <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-50 dark:divide-zinc-900/50">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <ShoppingBag className="h-10 w-10 mb-2" />
                    <p className="text-xs font-semibold">Your basket is empty.</p>
                    <p className="text-[10px] mt-1 text-slate-400">Select dishes from the catalog to load them here.</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.menuItemId} className="py-3 flex justify-between items-center first:pt-0">
                      <div className="space-y-0.5 max-w-[60%]">
                        <p className="text-xs font-bold text-slate-800 dark:text-zinc-200 truncate">{item.name}</p>
                        <p className="text-[10px] text-slate-400 dark:text-zinc-500">${item.price.toFixed(2)} each</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1.5 border border-slate-200 dark:border-zinc-800 rounded-card p-0.5">
                          <button onClick={() => updateQuantity(item.menuItemId, -1)} className="p-1 hover:bg-slate-100 rounded dark:hover:bg-zinc-800">
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.menuItemId, 1)} className="p-1 hover:bg-slate-100 rounded dark:hover:bg-zinc-800">
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button onClick={() => removeFromCart(item.menuItemId)} className="text-red-400 hover:text-red-650">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-4 border-t border-slate-100 dark:border-zinc-900 bg-slate-50/50 dark:bg-zinc-900/30 space-y-4 shrink-0">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center">
                    <MapPin className="h-3 w-3 mr-1" /> Delivery Shipping Address
                  </label>
                  <input
                    type="text"
                    placeholder="Street address, Apt #, Postal Code..."
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-input bg-white text-slate-850 focus:outline-none dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Promo Code</label>
                    <div className="flex space-x-1">
                      <input
                        type="text"
                        placeholder="WELCOME10"
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-input bg-white text-slate-850 focus:outline-none dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200"
                      />
                      <Button onClick={applyPromo} variant="outline" size="sm" icon={Tag}>Apply</Button>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="px-3 py-2 text-xs border bg-white border-slate-200 rounded-input focus:outline-none dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200 font-semibold"
                    >
                      <option value="cash">Cash on Delivery</option>
                      <option value="card">Card on Delivery</option>
                      <option value="online">Advance Online Payment</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs border-t border-slate-200 dark:border-zinc-800 pt-3">
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
                      <span>Promo Discount</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-sm text-slate-800 dark:text-zinc-100 pt-2 border-t border-slate-200 dark:border-zinc-800">
                    <span>Grand Total</span>
                    <span>${grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <Button 
                  onClick={handlePlaceOrder} 
                  variant="primary" 
                  className="w-full text-xs font-bold py-2.5" 
                  loading={loading}
                  disabled={cart.length === 0}
                >
                  Place Home Delivery Order
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Tab 2: Tracker view */
          <div className="flex-1 overflow-y-auto space-y-6">
            {trackedOrders.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                <Clock className="h-12 w-12 mb-2" />
                <p className="text-xs font-semibold">No active delivery orders currently.</p>
                <p className="text-[10px] text-slate-400 mt-1">Place an order from the menu tab to track it here in real-time.</p>
              </div>
            ) : (
              trackedOrders.map((order) => {
                const currentStep = getStatusStep(order.status);
                return (
                  <Card key={order._id} className="border border-slate-100 dark:border-zinc-900 bg-white dark:bg-zinc-950 p-6 shadow-soft space-y-4">
                    {/* Header details */}
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-150">Order {order.orderNumber}</h3>
                        <p className="text-[10px] text-slate-400 mt-0.5">Est. Delivery Address: {order.deliveryAddress}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-850 dark:text-zinc-200">${order.grandTotal.toFixed(2)}</span>
                        <p className="text-[10px] text-slate-400 uppercase font-semibold mt-0.5">{order.paymentMethod === 'online' ? 'Paid Online' : 'Pay on Delivery'}</p>
                      </div>
                    </div>

                    {/* Progress timeline */}
                    <div className="grid grid-cols-5 gap-2 relative pt-6 text-center text-xs font-bold">
                      {/* Line background */}
                      <div className="absolute top-10 left-10 right-10 h-1 bg-slate-100 dark:bg-zinc-900 z-0">
                        <div 
                          className="h-full bg-primary transition-all duration-500" 
                          style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
                        />
                      </div>

                      {/* Steps */}
                      {[
                        { step: 1, label: 'Order Placed' },
                        { step: 3, label: 'Rider Confirmed' },
                        { step: 4, label: 'In Kitchen' },
                        { step: 5, label: 'On The Way' },
                        { step: 6, label: 'Delivered' }
                      ].map((item, index) => {
                        const isCompleted = currentStep >= item.step;
                        const isActive = currentStep === item.step;
                        return (
                          <div key={index} className="flex flex-col items-center z-10">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                              isActive ? 'bg-primary text-white ring-4 ring-primary/20' : 
                              isCompleted ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400 dark:bg-zinc-900'
                            }`}>
                              {isCompleted ? <Check className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                            </div>
                            <span className={`text-[10px] mt-2 block ${
                              isActive ? 'text-primary font-bold animate-pulse' : 
                              isCompleted ? 'text-slate-800 dark:text-zinc-200' : 'text-slate-400'
                            }`}>
                              {item.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CustomerOrderPage;
