import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addToast } from '../../redux/slices/ui.slice';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import api from '../../services/api';
import { useSocket } from '../../contexts/SocketContext';
import { ChefHat, Clock, AlertCircle, Check, Play, CheckCircle } from 'lucide-react';

export const KitchenPage = () => {
  const dispatch = useDispatch();
  const socket = useSocket();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState(Date.now());

  useEffect(() => {
    fetchActiveOrders();
    // Refresh time offset trackers every 15 seconds
    const timer = setInterval(() => setTime(Date.now()), 15000);
    return () => clearInterval(timer);
  }, []);

  // Socket.IO event registrations for real-time ticket push
  useEffect(() => {
    if (!socket) return;

    socket.on('order_created', (newOrder) => {
      // Append if order is preparing/pending
      setOrders((prev) => {
        if (prev.find(o => o._id === newOrder._id)) return prev;
        // Play simulated audio alert toast
        dispatch(addToast({ message: `🚨 New Kitchen Order Ticket ${newOrder.orderNumber} placed!`, type: 'warning' }));
        return [newOrder, ...prev];
      });
    });

    socket.on('order_updated', (updatedOrder) => {
      setOrders((prev) => {
        // If order status is completed or cancelled, remove from KDS list
        if (['completed', 'cancelled', 'served'].includes(updatedOrder.status)) {
          return prev.filter(o => o._id !== updatedOrder._id);
        }
        // Otherwise update status
        return prev.map(o => o._id === updatedOrder._id ? updatedOrder : o);
      });
    });

    return () => {
      socket.off('order_created');
      socket.off('order_updated');
    };
  }, [socket, dispatch]);

  const fetchActiveOrders = async () => {
    setLoading(true);
    try {
      // Retrieve pending, preparing, and ready orders
      const res = await api.get('/orders');
      const active = res.data.data.items.filter(o => 
        ['pending', 'preparing', 'ready'].includes(o.status)
      );
      setOrders(active);
    } catch (err) {
      dispatch(addToast({ message: 'Error retrieving kitchen queue', type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, nextStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: nextStatus });
      dispatch(addToast({ message: `Ticket status updated to ${nextStatus}`, type: 'success' }));
    } catch (err) {
      dispatch(addToast({ message: 'Failed to update order status', type: 'error' }));
    }
  };

  // Calculate elapsed time since ticket creation
  const getElapsedTime = (createdAt) => {
    const elapsedMs = time - new Date(createdAt).getTime();
    const elapsedMins = Math.floor(elapsedMs / 60000);
    return `${elapsedMins} mins`;
  };

  // Calculate dynamic warning border based on preparation time threshold
  const getTicketUrgencyClass = (createdAt, status) => {
    if (status === 'ready') return 'border-emerald-500/30 dark:border-emerald-500/20';
    const elapsedMs = time - new Date(createdAt).getTime();
    const elapsedMins = Math.floor(elapsedMs / 60000);
    if (elapsedMins > 20) return 'border-red-500/40 animate-pulse dark:border-red-500/30';
    if (elapsedMins > 10) return 'border-amber-500/40 dark:border-amber-500/30';
    return 'border-slate-100 dark:border-zinc-900';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-zinc-50 flex items-center">
            <ChefHat className="h-6 w-6 mr-2 text-primary animate-bounce" /> Kitchen Display System (KDS)
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Real-time visual prep timers, ticket preparation notes, and status controllers synced via Socket.IO.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2 border-slate-200 dark:border-zinc-800">
            <CheckCircle className="h-10 w-10 text-emerald-500 mb-2" />
            <h4 className="font-bold text-slate-700 dark:text-zinc-300">Kitchen Queue Clear!</h4>
            <p className="text-xs text-slate-400 mt-1">Incoming POS orders will automatically display here in real time.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {orders.map((order) => (
              <Card 
                key={order._id} 
                className={`p-0 overflow-hidden flex flex-col justify-between border bg-white dark:bg-zinc-950 hover:shadow-premium transition-all ${
                  getTicketUrgencyClass(order.createdAt, order.status)
                }`}
              >
                {/* Header */}
                <div className="p-4 border-b border-slate-100 dark:border-zinc-900 bg-slate-50/50 dark:bg-zinc-900/30 flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-100">
                      {order.orderType === 'dine_in' ? `Table #${order.tableId?.number || '?'}` : 'Takeaway'}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-semibold">{order.orderNumber}</p>
                  </div>
                  <div className="flex items-center text-[10px] text-slate-500 font-semibold space-x-1">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span>{getElapsedTime(order.createdAt)}</span>
                  </div>
                </div>

                {/* Items details list */}
                <div className="p-4 flex-1 space-y-3">
                  {order.items.map((item) => (
                    <div key={item.menuItemId} className="text-xs flex justify-between items-start">
                      <div className="space-y-0.5">
                        <p className="font-bold text-slate-700 dark:text-zinc-200">
                          {item.quantity}x {item.name}
                        </p>
                        {item.notes && (
                          <p className="text-[10px] text-red-500 font-medium bg-red-50 dark:bg-red-950/20 px-1 py-0.5 rounded">
                            ↳ Note: {item.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Status Toggle Buttons */}
                <div className="p-3 border-t border-slate-100 dark:border-zinc-900 flex space-x-2 shrink-0">
                  {order.status === 'pending' && (
                    <Button 
                      onClick={() => handleUpdateStatus(order._id, 'preparing')}
                      variant="primary" 
                      size="sm" 
                      className="w-full text-xs font-semibold py-1.5"
                      icon={Play}
                    >
                      Prepare
                    </Button>
                  )}
                  {order.status === 'preparing' && (
                    <Button 
                      onClick={() => handleUpdateStatus(order._id, 'ready')}
                      variant="outline" 
                      size="sm" 
                      className="w-full text-xs font-semibold py-1.5 border-emerald-500 text-emerald-500 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/20"
                      icon={Check}
                    >
                      Complete
                    </Button>
                  )}
                  {order.status === 'ready' && (
                    <Button 
                      onClick={() => handleUpdateStatus(order._id, 'served')}
                      variant="secondary" 
                      size="sm" 
                      className="w-full text-xs font-semibold py-1.5"
                      icon={CheckCircle}
                    >
                      Serve Food
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default KitchenPage;
