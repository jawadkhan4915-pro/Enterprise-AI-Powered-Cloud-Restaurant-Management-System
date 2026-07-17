import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addToast } from '../../redux/slices/ui.slice';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import api from '../../services/api';
import { Calendar, Users, Clock, MessageSquare, Landmark } from 'lucide-react';

export const CustomerReservationPage = () => {
  const dispatch = useDispatch();

  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);

  const [bookingForm, setBookingForm] = useState({
    partySize: 2,
    reservationTime: '',
    tableId: '',
    notes: '',
  });

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    if (selectedBranchId) {
      fetchAvailableTables();
    }
  }, [selectedBranchId]);

  const fetchBranches = async () => {
    try {
      const res = await api.get('/restaurant/branches');
      setBranches(res.data.data.branches);
      if (res.data.data.branches.length > 0) {
        setSelectedBranchId(res.data.data.branches[0]._id);
      }
    } catch (err) {
      dispatch(addToast({ message: 'Error retrieving branches', type: 'error' }));
    }
  };

  const fetchAvailableTables = async () => {
    try {
      // Find tables for the Ground Floor or active layout
      const floorRes = await api.get(`/restaurant/floors?branchId=${selectedBranchId}`);
      if (floorRes.data.data.floors.length > 0) {
        const floorId = floorRes.data.data.floors[0]._id;
        const tablesRes = await api.get(`/restaurant/tables?floorId=${floorId}`);
        // Filter only available tables
        setTables(tablesRes.data.data.tables.filter(t => t.status === 'available'));
      }
    } catch (err) {
      dispatch(addToast({ message: 'Error loading seating arrangements', type: 'error' }));
    }
  };

  const handleBookTable = async (e) => {
    e.preventDefault();
    if (!bookingForm.reservationTime) {
      dispatch(addToast({ message: 'Please select a date and time', type: 'warning' }));
      return;
    }

    setLoading(true);
    try {
      const payload = {
        customerName: 'Customer User',
        customerPhone: '+44 7911 123456',
        branchId: selectedBranchId,
        ...bookingForm,
      };

      await api.post('/reservations', payload);
      dispatch(addToast({ message: 'Table reservation successfully booked!', type: 'success' }));
      
      // Reset form
      setBookingForm({
        partySize: 2,
        reservationTime: '',
        tableId: '',
        notes: '',
      });
      fetchAvailableTables();
    } catch (err) {
      dispatch(addToast({ message: 'Failed to book reservation', type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-zinc-50 flex items-center">
            <Calendar className="h-6 w-6 mr-2 text-primary" /> Book Your Dining Table
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Fill in your booking coordinates below to reserve a premium dining spot.
          </p>
        </div>

        <Card className="border border-slate-100 dark:border-zinc-900 shadow-premium p-6 bg-white dark:bg-zinc-950">
          <form onSubmit={handleBookTable} className="space-y-4">
            {/* Branch Selector */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-350 uppercase flex items-center">
                <Landmark className="h-3.5 w-3.5 mr-1 text-primary" /> Restaurant Branch
              </label>
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="px-3 py-2 text-xs border bg-white border-slate-205 rounded-input focus:outline-none dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-250 font-semibold"
                required
              >
                {branches.map(b => (
                  <option key={b._id} value={b._id}>{b.name} - {b.address}</option>
                ))}
              </select>
            </div>

            {/* DateTime input */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-350 uppercase flex items-center">
                <Clock className="h-3.5 w-3.5 mr-1 text-primary" /> Date & Time
              </label>
              <input
                type="datetime-local"
                value={bookingForm.reservationTime}
                onChange={(e) => setBookingForm(prev => ({ ...prev, reservationTime: e.target.value }))}
                className="px-3 py-2 text-xs border border-slate-200 rounded-input bg-white text-slate-850 focus:outline-none dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Party size count */}
              <Input
                label="Number of Guests"
                type="number"
                min="1"
                max="20"
                value={bookingForm.partySize}
                onChange={(e) => setBookingForm(prev => ({ ...prev, partySize: parseInt(e.target.value) || 2 }))}
                required
              />

              {/* Seating Arrangement Select */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Preferred Table (Optional)</label>
                <select
                  value={bookingForm.tableId}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, tableId: e.target.value }))}
                  className="px-3 py-2 text-xs border bg-white border-slate-205 rounded-input focus:outline-none dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-250"
                >
                  <option value="">No preference (Auto-assign)</option>
                  {tables.map(t => (
                    <option key={t._id} value={t._id}>Table #{t.number} (Seats {t.capacity})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notes */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-350 uppercase flex items-center">
                <MessageSquare className="h-3.5 w-3.5 mr-1 text-primary" /> Special Occasion / Notes
              </label>
              <textarea
                placeholder="e.g. Birthday dinner, window seating request, high-chair needed..."
                value={bookingForm.notes}
                onChange={(e) => setBookingForm(prev => ({ ...prev, notes: e.target.value }))}
                rows="3"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-input bg-white text-slate-850 focus:outline-none dark:bg-zinc-900 dark:border-zinc-850 dark:text-zinc-200"
              />
            </div>

            <Button 
              type="submit" 
              variant="primary" 
              className="w-full py-2.5 font-bold" 
              loading={loading}
            >
              Book Reservation Ticket
            </Button>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CustomerReservationPage;
