import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addToast } from '../../redux/slices/ui.slice';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import api from '../../services/api';
import { Truck, Phone, MapPin, DollarSign, RefreshCw, CheckCircle, Clock } from 'lucide-react';

export const RiderDeliveriesPage = () => {
  const dispatch = useDispatch();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders?limit=100');
      // Filter only delivery orders that are NOT completed or cancelled
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

  const handleCompleteDelivery = async (order) => {
    setLoading(true);
    try {
      if (order.paymentStatus === 'unpaid') {
        // Perform order pay (checkout) operation for cash/card on delivery
        await api.post(`/orders/${order._id}/checkout`, {
          paymentMethod: order.paymentMethod || 'cash',
        });
        dispatch(addToast({ message: `Order ${order.orderNumber} payment received & completed!`, type: 'success' }));
      } else {
        // Just update status to completed since it was already paid online
        await api.patch(`/orders/${order._id}/status`, { status: 'completed' });
        dispatch(addToast({ message: `Order ${order.orderNumber} marked as completed!`, type: 'success' }));
      }
      fetchDeliveries();
    } catch (err) {
      dispatch(addToast({ message: 'Failed to update delivery status', type: 'error' }));
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
              Track and update live home delivery orders. Perform pay actions upon cash handovers.
            </p>
          </div>
          <Button variant="outline" icon={RefreshCw} size="sm" onClick={fetchDeliveries} loading={loading}>
            Refresh Tasks
          </Button>
        </div>

        {/* Deliveries Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton variant="rectangular" height={160} />
            <Skeleton variant="rectangular" height={160} />
          </div>
        ) : deliveries.length === 0 ? (
          <Card className="text-center py-12 text-slate-400 font-semibold text-xs border-dashed border-2 border-slate-200 dark:border-zinc-800">
            No active deliveries assigned currently.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deliveries.map((delivery) => (
              <Card key={delivery._id} className="border border-slate-100 dark:border-zinc-900 bg-white dark:bg-zinc-950 p-5 shadow-soft flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  {/* Order header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-150">{delivery.orderNumber}</h4>
                      <p className="text-[10px] text-slate-400 font-semibold">Placed: {new Date(delivery.createdAt).toLocaleTimeString()}</p>
                    </div>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-pill capitalize ${
                      delivery.status === 'ready' ? 'bg-blue-100 text-blue-650' : 'bg-amber-100 text-amber-600'
                    }`}>
                      {delivery.status}
                    </span>
                  </div>

                  {/* Customer details */}
                  <div className="text-xs space-y-2 border-t border-b border-slate-100 dark:border-zinc-900 py-3">
                    <div className="flex items-center text-slate-600 dark:text-zinc-350">
                      <Truck className="h-3.5 w-3.5 mr-2 text-primary shrink-0" />
                      <span className="font-semibold truncate">{delivery.customerDetails?.name || 'Customer'}</span>
                    </div>
                    <div className="flex items-center text-slate-650 dark:text-zinc-350">
                      <Phone className="h-3.5 w-3.5 mr-2 text-primary shrink-0" />
                      <span className="font-medium">{delivery.customerDetails?.phone || 'No phone'}</span>
                    </div>
                    <div className="flex items-start text-slate-500">
                      <MapPin className="h-3.5 w-3.5 mr-2 text-primary shrink-0 mt-0.5" />
                      <span className="font-semibold leading-normal">{delivery.deliveryAddress || 'No shipping address provided'}</span>
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
                <Button 
                  onClick={() => handleCompleteDelivery(delivery)}
                  variant="primary" 
                  className="w-full text-xs font-bold py-2 flex items-center justify-center gap-1.5"
                  icon={CheckCircle}
                >
                  {delivery.paymentStatus === 'unpaid' ? 'Collect Pay & Deliver' : 'Complete Delivery'}
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default RiderDeliveriesPage;
