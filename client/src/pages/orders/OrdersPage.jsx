import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addToast } from '../../redux/slices/ui.slice';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import api from '../../services/api';
import usePermission from '../../hooks/usePermission';
import { Receipt, Search, Eye, Filter, Info, DollarSign, Printer } from 'lucide-react';

export const OrdersPage = () => {
  const dispatch = useDispatch();
  const { hasPermission } = usePermission();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Selected order details drawer/modal
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handlePrintInvoice = (order) => {
    const printWindow = window.open('', '_blank', 'width=600,height=850');
    const itemsHtml = order.items.map(item => `
      <tr style="border-bottom: 1px dashed #ddd;">
        <td style="padding: 6px 0; font-size: 13px;">${item.quantity}x ${item.name}</td>
        <td style="padding: 6px 0; text-align: right; font-size: 13px;">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${order.orderNumber}</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; color: #000; padding: 20px; font-size: 14px; }
            .header { text-align: center; margin-bottom: 20px; }
            .header h2 { margin: 0 0 5px 0; font-size: 18px; text-transform: uppercase; }
            .header p { margin: 0; font-size: 12px; color: #555; }
            .details { margin-bottom: 15px; font-size: 12px; line-height: 1.4; border-bottom: 1px dashed #000; padding-bottom: 10px; }
            .table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
            .totals { margin-top: 15px; border-top: 1px dashed #000; padding-top: 10px; font-size: 13px; }
            .total-line { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .grand-total { font-weight: bold; font-size: 15px; border-top: 1px double #000; padding-top: 5px; margin-top: 5px; }
            .footer { text-align: center; margin-top: 30px; font-size: 11px; font-style: italic; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>RestaurantOS AI</h2>
            <p>London Central Branch</p>
            <p>Tel: +44 20 7946 0958</p>
          </div>
          <div class="details">
            <div><strong>Order:</strong> ${order.orderNumber}</div>
            <div><strong>Type:</strong> ${order.orderType.replace('_', ' ').toUpperCase()}</div>
            ${order.tableId?.number ? `<div><strong>Table:</strong> #${order.tableId.number}</div>` : ''}
            <div><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</div>
            ${order.customerDetails?.name ? `<div><strong>Customer:</strong> ${order.customerDetails.name}</div>` : ''}
          </div>
          <table class="table">
            <thead>
              <tr style="border-bottom: 1px solid #000;">
                <th style="text-align: left; font-size: 12px; padding-bottom: 5px;">Item</th>
                <th style="text-align: right; font-size: 12px; padding-bottom: 5px;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          <div class="totals">
            <div class="total-line">
              <span>Subtotal:</span>
              <span>$${order.subTotal.toFixed(2)}</span>
            </div>
            <div class="total-line">
              <span>Tax (${order.tax.rate}%):</span>
              <span>$${order.tax.amount.toFixed(2)}</span>
            </div>
            ${order.discount?.amount > 0 ? `
              <div class="total-line" style="color: #000;">
                <span>Discount:</span>
                <span>-$${order.discount.amount.toFixed(2)}</span>
              </div>
            ` : ''}
            <div class="total-line grand-total">
              <span>GRAND TOTAL:</span>
              <span>$${order.grandTotal.toFixed(2)}</span>
            </div>
          </div>
          <div class="footer">
            <p>Thank you for dining with us!</p>
            <p>Powered by RestaurantOS AI</p>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const url = statusFilter ? `/orders?status=${statusFilter}` : '/orders';
      const res = await api.get(url);
      setOrders(res.data.data.items);
    } catch (err) {
      dispatch(addToast({ message: 'Error retrieving orders history', type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      pending: 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300',
      preparing: 'bg-amber-100 text-amber-600 dark:bg-amber-950/20 dark:text-amber-500',
      ready: 'bg-blue-100 text-blue-600 dark:bg-blue-950/20 dark:text-blue-500',
      served: 'bg-purple-100 text-purple-600 dark:bg-purple-950/20 dark:text-purple-500',
      completed: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-500',
      cancelled: 'bg-red-100 text-red-600 dark:bg-red-950/20 dark:text-red-500',
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

  const getPaymentBadgeColor = (status) => {
    return status === 'paid' 
      ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-500' 
      : 'bg-red-100 text-red-650 dark:bg-red-950/20 dark:text-red-500';
  };

  // Filter orders by search value locally
  const filteredOrders = orders.filter((o) => 
    o.orderNumber.toLowerCase().includes(searchVal.toLowerCase()) ||
    (o.customerDetails?.name && o.customerDetails.name.toLowerCase().includes(searchVal.toLowerCase()))
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-zinc-50 flex items-center">
            <Receipt className="h-6 w-6 mr-2 text-primary" /> Order History
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Browse and filter active and historical customer order tickets, cash drawer transactions.
          </p>
        </div>

        {/* Filter controls row */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex items-center bg-white border border-slate-200 dark:bg-zinc-900 dark:border-zinc-800 px-3 py-2 rounded-card shadow-soft w-full sm:max-w-xs">
            <Search className="h-4 w-4 text-slate-400 mr-2" />
            <input
              type="text"
              placeholder="Search by order #..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full text-xs bg-transparent focus:outline-none text-slate-800 dark:text-zinc-200"
            />
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs border bg-white border-slate-200 rounded-input focus:outline-none dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders Table list */}
        {loading ? (
          <div className="space-y-3">
            <Skeleton variant="text" height={40} />
            <Skeleton variant="text" height={40} />
            <Skeleton variant="text" height={40} />
          </div>
        ) : filteredOrders.length === 0 ? (
          <Card className="text-center py-12 text-slate-400 font-semibold text-xs border-dashed border-2 border-slate-200 dark:border-zinc-800">
            No order logs matching query coordinates.
          </Card>
        ) : (
          <Card className="p-0 overflow-hidden border border-slate-100 dark:border-zinc-900 shadow-soft bg-white dark:bg-zinc-950">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-xs text-slate-500 dark:text-zinc-400">
                <thead className="bg-slate-50/50 dark:bg-zinc-900/30 text-slate-700 dark:text-zinc-250 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-4">Order #</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Table</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Payment</th>
                    <th className="p-4">Time Placed</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-zinc-900/50">
                  {filteredOrders.map((o) => (
                    <tr key={o._id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/20">
                      <td className="p-4 font-bold text-slate-800 dark:text-zinc-200">{o.orderNumber}</td>
                      <td className="p-4 capitalize">{o.orderType.replace('_', ' ')}</td>
                      <td className="p-4 font-semibold">{o.tableId?.number ? `#${o.tableId.number}` : '-'}</td>
                      <td className="p-4 font-bold text-slate-800 dark:text-zinc-200">${o.grandTotal.toFixed(2)}</td>
                      <td className="p-4">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-pill ${getStatusBadgeColor(o.status)}`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-pill ${getPaymentBadgeColor(o.paymentStatus)}`}>
                          {o.paymentStatus}
                        </span>
                      </td>
                      <td className="p-4 text-[10px] text-slate-400">{new Date(o.createdAt).toLocaleTimeString()}</td>
                      <td className="p-4 text-right">
                        <Button 
                          onClick={() => setSelectedOrder(o)}
                          variant="text" 
                          size="sm" 
                          className="hover:bg-slate-100 rounded dark:hover:bg-zinc-900"
                        >
                          <Eye className="h-4 w-4 text-slate-400" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Selected Order Drawer Modal overlay */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white border border-slate-100 dark:bg-zinc-950 dark:border-zinc-900 w-full max-w-sm rounded-card p-6 shadow-premium space-y-4 animate-scale-in max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-150">Order Detail</h3>
                  <p className="text-[10px] text-slate-400 font-semibold">{selectedOrder.orderNumber}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-slate-600">Close</button>
              </div>

              {/* Items List */}
              <div className="space-y-3 divide-y divide-slate-50 dark:divide-zinc-900/50">
                {selectedOrder.items.map((item) => (
                  <div key={item.menuItemId} className="flex justify-between text-xs py-2.5 first:pt-0">
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-800 dark:text-zinc-200">{item.quantity}x {item.name}</p>
                      {item.notes && <p className="text-[10px] text-red-500">Note: {item.notes}</p>}
                    </div>
                    <span className="font-bold text-slate-850 dark:text-zinc-250">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Calculations lines */}
              <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 space-y-1.5 text-xs text-slate-500">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${selectedOrder.subTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax ({selectedOrder.tax.rate}%)</span>
                  <span>${selectedOrder.tax.amount.toFixed(2)}</span>
                </div>
                {selectedOrder.discount?.amount > 0 && (
                  <div className="flex justify-between text-emerald-500 font-bold">
                    <span>Discount</span>
                    <span>-${selectedOrder.discount.amount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-slate-800 dark:text-zinc-200 pt-2 border-t border-slate-200 dark:border-zinc-800 text-sm">
                  <span>Grand Total</span>
                  <span>${selectedOrder.grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {hasPermission('manage_pos') && (
                <div className="pt-4 border-t border-slate-200 dark:border-zinc-800">
                  <Button 
                    onClick={() => handlePrintInvoice(selectedOrder)} 
                    variant="primary" 
                    className="w-full flex items-center justify-center gap-2 py-2.5 animate-fade-in"
                    icon={Printer}
                  >
                    Print Receipt Invoice
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default OrdersPage;
