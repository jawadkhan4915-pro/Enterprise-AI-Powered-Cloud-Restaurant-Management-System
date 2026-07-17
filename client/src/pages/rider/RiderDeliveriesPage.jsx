import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addToast } from '../../redux/slices/ui.slice';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import api from '../../services/api';
import { useSocket } from '../../contexts/SocketContext';
import { Truck, Phone, MapPin, DollarSign, RefreshCw, CheckCircle, Clock, Send, ShieldAlert, Check } from 'lucide-react';

export const RiderDeliveriesPage = () => {
  const dispatch = useDispatch();
  const socket = useSocket();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDeliveries();
  }, []);

  // Listen to socket events for real-time order status updates and creations
  useEffect(() => {
    if (!socket) return;

    const handleOrderUpdated = (updatedOrder) => {
      if (updatedOrder.orderType === 'delivery') {
        fetchDeliveries();
        
        // Notify rider if order changes to 'ready' status
        if (updatedOrder.status === 'ready') {
          dispatch(addToast({ 
            message: `🔔 Delivery Order ${updatedOrder.orderNumber} is READY! Pick up from kitchen.`, 
            type: 'success' 
          }));
        } else {
          dispatch(addToast({
            message: `📦 Order ${updatedOrder.orderNumber} status updated to ${updatedOrder.status.toUpperCase()}`,
            type: 'info'
          }));
        }
      }
    };

    const handleOrderCreated = (newOrder) => {
      if (newOrder.orderType === 'delivery') {
        fetchDeliveries();
        dispatch(addToast({ 
          message: `🚚 New Delivery Order ${newOrder.orderNumber} placed! Call customer to confirm.`, 
          type: 'info' 
        }));
      }
    };

    socket.on('order_updated', handleOrderUpdated);
    socket.on('order_created', handleOrderCreated);

    return () => {
      socket.off('order_updated', handleOrderUpdated);
      socket.off('order_created', handleOrderCreated);
    };
  }, [socket]);

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders?limit=100');
      // Filter only delivery orders that are active (not completed/cancelled)
      const activeDeliveries = res.data.data.items.filter(
        (o) => o.orderType === 'delivery' && o.status !== 'completed' && o.status !== 'cancelled'
      );
      setDeliveries(activeDeliveries);
    } catch (err) {
      dispatch(addToast({ message: 'Error loading rider deliveries list', type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  // State transitions
  const handleConfirmCallAndSend = async (orderId) => {
    setLoading(true);
    try {
      // 1. Rider confirms on phone call, then sends to kitchen by setting to 'preparing'
      await api.patch(`/orders/${orderId}/status`, { status: 'preparing' });
      dispatch(addToast({ message: 'Order confirmed on call and sent to kitchen!', type: 'success' }));
      fetchDeliveries();
    } catch (err) {
      dispatch(addToast({ message: 'Failed to update order to preparing', type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  const handleStartDelivery = async (orderId) => {
    setLoading(true);
    try {
      // 2. Rider picks up ready order and starts delivery by setting to 'served' (out for delivery)
      await api.patch(`/orders/${orderId}/status`, { status: 'served' });
      dispatch(addToast({ message: 'Order picked up! Delivery in progress.', type: 'success' }));
      fetchDeliveries();
    } catch (err) {
      dispatch(addToast({ message: 'Failed to update order to out for delivery', type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteDelivery = async (order) => {
    setLoading(true);
    try {
      if (order.paymentStatus === 'unpaid') {
        // Perform order pay (checkout) operation for cash/card on delivery
        await api.post(`/orders/${order._id}/checkout`, {
          paymentMethod: order.paymentMethod || 'cash',
        });
        dispatch(addToast({ message: `Payment recorded & Order ${order.orderNumber} completed!`, type: 'success' }));
      } else {
        // Just update status to completed since it was already paid online
        await api.patch(`/orders/${order._id}/status`, { status: 'completed' });
        dispatch(addToast({ message: `Order ${order.orderNumber} marked as completed!`, type: 'success' }));
      }
      fetchDeliveries();
    } catch (err) {
      dispatch(addToast({ message: 'Failed to complete delivery status update', type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-zinc-50 flex items-center">
              <Truck className="h-6 w-6 mr-2 text-primary" /> Rider Deliveries Dashboard
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Confirm orders on call, send to kitchen, track readiness, and record cash handovers on delivery.
            </p>
          </div>
          <Button variant="outline" icon={RefreshCw} size="sm" onClick={fetchDeliveries} loading={loading}>
            Refresh Tasks
          </Button>
        </div>

        {/* Deliveries Grid */}
        {loading && deliveries.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton variant="rectangular" height={200} />
            <Skeleton variant="rectangular" height={200} />
          </div>
        ) : deliveries.length === 0 ? (
          <Card className="text-center py-12 text-slate-400 font-semibold text-xs border-dashed border-2 border-slate-200 dark:border-zinc-800">
            No active delivery tasks assigned.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deliveries.map((delivery) => (
              <Card key={delivery._id} className="border border-slate-105 dark:border-zinc-900 bg-white dark:bg-zinc-950 p-5 shadow-soft flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  {/* Order header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-150">{delivery.orderNumber}</h4>
                      <p className="text-[10px] text-slate-400 font-semibold">Placed: {new Date(delivery.createdAt).toLocaleTimeString()}</p>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-pill capitalize ${
                      delivery.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      delivery.status === 'preparing' ? 'bg-orange-100 text-orange-650' :
                      delivery.status === 'ready' ? 'bg-emerald-100 text-emerald-700 animate-pulse' :
                      'bg-blue-100 text-blue-650'
                    }`}>
                      {delivery.status === 'pending' ? 'Call to Confirm' :
                       delivery.status === 'preparing' ? 'In Kitchen (Preparing)' :
                       delivery.status === 'ready' ? 'Ready for Pickup' :
                       'Out for Delivery'}
                    </span>
                  </div>

                  {/* Customer details */}
                  <div className="text-xs space-y-2 border-t border-b border-slate-100 dark:border-zinc-900 py-3">
                    <div className="flex items-center text-slate-600 dark:text-zinc-350">
                      <Truck className="h-3.5 w-3.5 mr-2 text-primary shrink-0" />
                      <span className="font-semibold truncate">{delivery.customerDetails?.name || 'Customer'}</span>
                    </div>
                    <div className="flex items-center text-slate-650 dark:text-zinc-350 justify-between">
                      <div className="flex items-center">
                        <Phone className="h-3.5 w-3.5 mr-2 text-primary shrink-0" />
                        <span className="font-medium">{delivery.customerDetails?.phone || 'No phone'}</span>
                      </div>
                      {delivery.status === 'pending' && (
                        <span className="text-[9px] font-bold text-red-500 bg-red-100 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <ShieldAlert className="h-3 w-3" /> Call Required
                        </span>
                      )}
                    </div>
                    <div className="flex items-start text-slate-500">
                      <MapPin className="h-3.5 w-3.5 mr-2 text-primary shrink-0 mt-0.5" />
                      <span className="font-semibold leading-normal">{delivery.deliveryAddress || 'No shipping address'}</span>
                    </div>
                  </div>

                  {/* Pricing details */}
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-500">Amount Due:</span>
                    <span className="font-bold text-slate-850 dark:text-zinc-200 text-sm flex items-center">
                      <DollarSign className="h-4 w-4 mr-0.5 text-emerald-500" /> {delivery.grandTotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-500">Payment Type:</span>
                    <span className="font-bold uppercase text-[10px] text-slate-400">
                      {delivery.paymentMethod === 'online' ? 'PAID ONLINE' : `${delivery.paymentMethod} ON DELIVERY`}
                    </span>
                  </div>
                </div>

                {/* Confirm complete button */}
                {delivery.status === 'pending' && (
                  <Button 
                    onClick={() => handleConfirmCallAndSend(delivery._id)}
                    variant="primary" 
                    className="w-full text-xs font-bold py-2 flex items-center justify-center gap-1.5"
                    icon={Send}
                  >
                    Confirm & Send to Kitchen
                  </Button>
                )}

                {delivery.status === 'preparing' && (
                  <div className="w-full p-2 bg-slate-100 dark:bg-zinc-900 rounded-card flex items-center justify-center text-xs font-semibold text-slate-500 gap-1.5 border border-slate-200 dark:border-zinc-800">
                    <Clock className="h-3.5 w-3.5 animate-spin" /> Waiting for Kitchen to cook...
                  </div>
                )}

                {delivery.status === 'ready' && (
                  <Button 
                    onClick={() => handleStartDelivery(delivery._id)}
                    variant="primary" 
                    className="w-full text-xs font-bold py-2 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                    icon={Check}
                  >
                    Pick Up & Start Delivery
                  </Button>
                )}

                {delivery.status === 'served' && (
                  <Button 
                    onClick={() => handleCompleteDelivery(delivery)}
                    variant="primary" 
                    className="w-full text-xs font-bold py-2 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700"
                    icon={CheckCircle}
                  >
                    {delivery.paymentStatus === 'unpaid' ? 'Collect Pay & Complete' : 'Complete Delivery'}
                  </Button>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default RiderDeliveriesPage;
