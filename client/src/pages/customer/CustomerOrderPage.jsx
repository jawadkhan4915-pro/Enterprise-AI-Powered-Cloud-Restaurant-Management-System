import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addToast } from '../../redux/slices/ui.slice';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import api from '../../services/api';
import { ShoppingCart, Search, Receipt, Trash2, Plus, Minus, Tag, Landmark, User, CreditCard, ShoppingBag, MapPin } from 'lucide-react';

export const CustomerOrderPage = () => {
  const dispatch = useDispatch();

  // Menu states
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchVal, setSearchVal] = useState('');

  // Cart states
  const [cart, setCart] = useState([]);
  const [orderType, setOrderType] = useState('dine_in'); // dine_in, takeaway, delivery
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash'); // cash, card, online
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMenuData();
  }, []);

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
    if (orderType === 'delivery' && !deliveryAddress.trim()) {
      dispatch(addToast({ message: 'Please provide a delivery address', type: 'warning' }));
      return;
    }

    setLoading(true);
    try {
      // 1. Place the order
      const orderPayload = {
        orderType,
        deliveryAddress: orderType === 'delivery' ? deliveryAddress : '',
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

      // 2. If client pays via Advance Online Payment Method, automatically process immediate checkout!
      if (paymentMethod === 'online') {
        await api.post(`/orders/${newOrder._id}/checkout`, {
          paymentMethod: 'online',
          discountAmount: discountAmount,
        });
        dispatch(addToast({ message: `Order ${newOrder.orderNumber} placed & paid online successfully!`, type: 'success' }));
      } else {
        dispatch(addToast({ message: `Order ${newOrder.orderNumber} submitted successfully!`, type: 'success' }));
      }

      // Reset cart
      setCart([]);
      setDiscountCode('');
      setDiscountAmount(0);
      setDeliveryAddress('');
      setPaymentMethod('cash');
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

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-120px)] overflow-hidden">
        {/* Left Side: Items Catalog (Cols 7) */}
        <div className="lg:col-span-7 flex flex-col h-full overflow-hidden space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center bg-white border border-slate-200 dark:bg-zinc-900 dark:border-zinc-800 px-3 py-2 rounded-card shadow-soft flex-1">
              <Search className="h-4 w-4 text-slate-400 mr-2" />
              <input
                type="text"
                placeholder="Search food menu items..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full text-xs bg-transparent focus:outline-none text-slate-800 dark:text-zinc-200"
              />
            </div>
            {/* Delivery type selectors */}
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
                    <span className="text-[9px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded-pill">Add to Plate</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Online Cart Summary (Cols 5) */}
        <div className="lg:col-span-5 flex flex-col h-full overflow-hidden bg-white dark:bg-zinc-950 border border-slate-100 dark:border-zinc-900 rounded-card shadow-premium">
          <div className="p-4 border-b border-slate-100 dark:border-zinc-900 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-900/30">
            <span className="font-bold text-sm text-slate-800 dark:text-zinc-100 flex items-center">
              <ShoppingCart className="h-4.5 w-4.5 mr-2 text-primary" /> My Dinner Basket
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">{cart.length} items</span>
          </div>

          {/* Cart list scroll area */}
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

          {/* Delivery & Payment details form selection */}
          <div className="p-4 border-t border-slate-100 dark:border-zinc-900 bg-slate-50/50 dark:bg-zinc-900/30 space-y-4 shrink-0">
            {orderType === 'delivery' && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center">
                  <MapPin className="h-3 w-3 mr-1" /> Delivery Address
                </label>
                <input
                  type="text"
                  placeholder="Street name, Apt #, Postal Code..."
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-input bg-white text-slate-850 focus:outline-none dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200"
                  required
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {/* Promo input */}
              <div className="flex flex-col space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Promo Code</label>
                <div className="flex space-x-1">
                  <input
                    type="text"
                    placeholder="e.g. WELCOME10"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-input bg-white text-slate-850 focus:outline-none dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200"
                  />
                  <Button onClick={applyPromo} variant="outline" size="sm" icon={Tag}>Apply</Button>
                </div>
              </div>

              {/* Payment selector */}
              <div className="flex flex-col space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="px-3 py-2 text-xs border bg-white border-slate-200 rounded-input focus:outline-none dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200"
                >
                  <option value="cash">Cash on Delivery / Dining</option>
                  <option value="card">Credit / Debit Card</option>
                  <option value="online">Advance Online Payment</option>
                </select>
              </div>
            </div>

            {/* Price Calculations */}
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
              Place Online Order
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CustomerOrderPage;
