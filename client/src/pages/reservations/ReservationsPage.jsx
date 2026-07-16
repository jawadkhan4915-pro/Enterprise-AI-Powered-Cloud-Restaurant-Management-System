import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { addToast } from '../../redux/slices/ui.slice';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import api from '../../services/api';
import { useSocket } from '../../contexts/SocketContext';
import { Calendar, Save, Plus, HelpCircle, Users, CheckCircle, RefreshCw, Clock, X, User } from 'lucide-react';

export const ReservationsPage = () => {
  const dispatch = useDispatch();
  const socket = useSocket();
  const canvasRef = useRef(null);

  const [branches, setBranches] = useState([]);
  const [activeBranchId, setActiveBranchId] = useState('');
  const [floors, setFloors] = useState([]);
  const [activeFloorId, setActiveFloorId] = useState('');
  const [tables, setTables] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);

  // Drag states
  const [draggingTableId, setDraggingTableId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Creation Drawer Forms
  const [showAddTable, setShowAddTable] = useState(false);
  const [newTable, setNewTable] = useState({ number: '', capacity: 4, shape: 'square' });

  const [showAddBooking, setShowAddBooking] = useState(false);
  const [newBooking, setNewBooking] = useState({
    customerName: '',
    customerPhone: '',
    partySize: 2,
    reservationTime: '',
    tableId: '',
    notes: '',
  });

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    if (activeBranchId) {
      fetchFloors();
      fetchReservations();
    }
  }, [activeBranchId]);

  useEffect(() => {
    if (activeFloorId) {
      fetchTables();
    }
  }, [activeFloorId]);

  // Real-time table status updates from POS checkout or status transitions
  useEffect(() => {
    if (!socket) return;
    socket.on('table_status_sync', () => {
      fetchTables();
      fetchReservations();
    });
    return () => {
      socket.off('table_status_sync');
    };
  }, [socket, activeFloorId]);

  const fetchBranches = async () => {
    try {
      const res = await api.get('/restaurant/branches');
      setBranches(res.data.data.branches);
      if (res.data.data.branches.length > 0) {
        setActiveBranchId(res.data.data.branches[0]._id);
      }
    } catch (err) {
      dispatch(addToast({ message: 'Error loading locations', type: 'error' }));
    }
  };

  const fetchFloors = async () => {
    try {
      const res = await api.get(`/restaurant/floors?branchId=${activeBranchId}`);
      setFloors(res.data.data.floors);
      if (res.data.data.floors.length > 0) {
        setActiveFloorId(res.data.data.floors[0]._id);
      }
    } catch (err) {
      dispatch(addToast({ message: 'Error loading floors list', type: 'error' }));
    }
  };

  const fetchTables = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/restaurant/tables?floorId=${activeFloorId}`);
      setTables(res.data.data.tables);
    } catch (err) {
      dispatch(addToast({ message: 'Error loading floor plan layout', type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  const fetchReservations = async () => {
    try {
      const res = await api.get(`/reservations?branchId=${activeBranchId}`);
      setReservations(res.data.data.items);
    } catch (err) {
      dispatch(addToast({ message: 'Error loading reservations list', type: 'error' }));
    }
  };

  // Drag & drop logic
  const handleMouseDown = (e, table) => {
    e.preventDefault();
    if (!canvasRef.current) return;
    
    setDraggingTableId(table._id);
    
    // Calculate initial mouse click offset relative to the table card top-left corner
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    setDragOffset({
      x: mouseX - table.position.x,
      y: mouseY - table.position.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!draggingTableId || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - dragOffset.x;
    const mouseY = e.clientY - dragOffset.y;

    // Relative to canvas coordinates bounds
    const canvasRect = canvasRef.current.getBoundingClientRect();
    let newX = Math.round(e.clientX - canvasRect.left - dragOffset.x);
    let newY = Math.round(e.clientY - canvasRect.top - dragOffset.y);

    // Enforce boundaries
    newX = Math.max(10, Math.min(newX, canvasRect.width - 90));
    newY = Math.max(10, Math.min(newY, canvasRect.height - 90));

    setTables((prev) =>
      prev.map((t) => (t._id === draggingTableId ? { ...t, position: { x: newX, y: newY } } : t))
    );
  };

  const handleMouseUp = () => {
    setDraggingTableId(null);
  };

  const handleSaveLayout = async () => {
    setLoading(true);
    try {
      const layoutArray = tables.map((t) => ({
        id: t._id,
        number: t.number,
        shape: t.shape,
        capacity: t.capacity,
        position: t.position,
        size: t.size,
      }));
      await api.put('/restaurant/tables/layout', { layout: layoutArray });
      dispatch(addToast({ message: 'Floor layout saved successfully', type: 'success' }));
    } catch (err) {
      dispatch(addToast({ message: 'Failed to save layout coordinates', type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFloor = async () => {
    const floorName = prompt('Enter name of floor/level (e.g. Rooftop):');
    if (!floorName) return;
    try {
      const level = floors.length;
      const res = await api.post('/restaurant/floors', {
        branchId: activeBranchId,
        name: floorName,
        level,
      });
      setFloors(prev => [...prev, res.data.data.floor]);
      setActiveFloorId(res.data.data.floor._id);
      dispatch(addToast({ message: 'New floor level configured', type: 'success' }));
    } catch (err) {
      dispatch(addToast({ message: 'Failed to create floor level', type: 'error' }));
    }
  };

  const handleAddTable = async (e) => {
    e.preventDefault();
    if (!newTable.number.trim()) return;
    setLoading(true);
    try {
      const res = await api.post('/restaurant/tables', {
        branchId: activeBranchId,
        floorId: activeFloorId,
        number: newTable.number,
        capacity: newTable.capacity,
        shape: newTable.shape,
        position: { x: 50, y: 50 },
      });
      setTables(prev => [...prev, res.data.data.table]);
      setNewTable({ number: '', capacity: 4, shape: 'square' });
      setShowAddTable(false);
      dispatch(addToast({ message: 'Table node added to floor canvas', type: 'success' }));
    } catch (err) {
      dispatch(addToast({ message: 'Failed to add table configuration', type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  // ── CRM bookings bookings logic ───────────────────────────────────────────
  const handleAddBooking = async (e) => {
    e.preventDefault();
    if (!newBooking.customerName.trim() || !newBooking.customerPhone.trim() || !newBooking.reservationTime) {
      dispatch(addToast({ message: 'Name, Phone, and Time are required', type: 'error' }));
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...newBooking,
        branchId: activeBranchId,
      };
      const res = await api.post('/reservations', payload);
      setReservations(prev => [res.data.data.reservation, ...prev]);
      setShowAddBooking(false);
      setNewBooking({ customerName: '', customerPhone: '', partySize: 2, reservationTime: '', tableId: '', notes: '' });
      dispatch(addToast({ message: 'New booking registered', type: 'success' }));
      fetchTables(); // Reload tables layout to reflect the potentially reserved state
    } catch (err) {
      dispatch(addToast({ message: 'Failed to register booking', type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  const handleSeatCustomer = async (bookingId) => {
    try {
      await api.patch(`/reservations/${bookingId}/status`, { status: 'seated' });
      dispatch(addToast({ message: 'Customer marked as Seated. Table state updated.', type: 'success' }));
      fetchTables();
      fetchReservations();
    } catch (err) {
      dispatch(addToast({ message: 'Failed to seat customer', type: 'error' }));
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-zinc-50 flex items-center">
              <Calendar className="h-6 w-6 mr-2 text-primary" /> Visual Floor Planner & Bookings
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Drag and drop tables to construct visual floor plan layouts and seat reservations in real time.
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" icon={Plus} onClick={() => setShowAddBooking(true)}>
              Book Table
            </Button>
            <Button variant="outline" size="sm" icon={Plus} onClick={handleCreateFloor}>
              Floor Level
            </Button>
            <Button variant="outline" size="sm" icon={Plus} onClick={() => setShowAddTable(!showAddTable)}>
              Table Node
            </Button>
            <Button variant="primary" size="sm" icon={Save} onClick={handleSaveLayout} loading={loading}>
              Save Layout
            </Button>
          </div>
        </div>

        {/* Level Selectors */}
        <div className="flex items-center space-x-4 border-b border-slate-100 dark:border-zinc-900 pb-3">
          <div className="flex flex-wrap gap-2">
            {floors.map((fl) => (
              <button
                key={fl._id}
                onClick={() => setActiveFloorId(fl._id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-pill transition-colors ${
                  activeFloorId === fl._id ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-slate-200'
                }`}
              >
                {fl.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Visual Drag Canvas Grid */}
          <div className="lg:col-span-3">
            {/* Draw Form panel in overlay inside canvas when showAddTable is true */}
            {showAddTable && (
              <form onSubmit={handleAddTable} className="mb-4 p-4 border border-primary/20 bg-slate-50 dark:bg-zinc-900/30 rounded-card space-y-4 animate-scale-in">
                <h4 className="text-xs font-bold text-slate-700 dark:text-zinc-300">Add New Table</h4>
                <div className="grid grid-cols-3 gap-4">
                  <Input 
                    label="Table Number" 
                    placeholder="e.g. 10" 
                    value={newTable.number}
                    onChange={(e) => setNewTable(prev => ({ ...prev, number: e.target.value }))}
                    required 
                  />
                  <Input 
                    label="Seating Capacity" 
                    type="number"
                    value={newTable.capacity}
                    onChange={(e) => setNewTable(prev => ({ ...prev, capacity: parseInt(e.target.value, 10) }))}
                    required 
                  />
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Shape</label>
                    <select
                      value={newTable.shape}
                      onChange={(e) => setNewTable(prev => ({ ...prev, shape: e.target.value }))}
                      className="px-3 py-2 text-xs border bg-white border-slate-300 rounded-input focus:outline-none focus:ring-1 focus:ring-primary dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200"
                    >
                      <option value="square">Square</option>
                      <option value="circle">Circle</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setShowAddTable(false)}>Cancel</Button>
                  <Button type="submit" variant="primary" size="sm" loading={loading}>Add Node</Button>
                </div>
              </form>
            )}

            {/* Canvas */}
            <div 
              ref={canvasRef}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="relative w-full h-[480px] border border-slate-100 dark:border-zinc-900 rounded-card bg-slate-50 dark:bg-zinc-950 overflow-hidden shadow-soft cursor-default"
            >
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-zinc-950/50">
                  <RefreshCw className="h-8 w-8 text-primary animate-spin" />
                </div>
              ) : tables.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 dark:text-zinc-600">
                  <Calendar className="h-10 w-10 mb-2" />
                  <p className="text-xs font-semibold">No tables seeded on this floor layout yet.</p>
                  <p className="text-[10px] mt-1">Click "Table Node" to place your first table.</p>
                </div>
              ) : (
                tables.map((table) => {
                  const isCircle = table.shape === 'circle';
                  const isOccupied = table.status === 'occupied';
                  const isReserved = table.status === 'reserved';
                  const isDirty = table.status === 'dirty';
                  
                  const bgColors = isOccupied ? 'bg-red-500 border-red-650 text-white' : 
                                   isReserved ? 'bg-blue-555 border-blue-650 text-white' :
                                   isDirty ? 'bg-amber-500 border-amber-600 text-white' :
                                   'bg-white border-slate-200 text-slate-700 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200';

                  return (
                    <div
                      key={table._id}
                      onMouseDown={(e) => handleMouseDown(e, table)}
                      className={`absolute select-none shadow-soft border flex flex-col items-center justify-center p-2 cursor-grab active:cursor-grabbing transition-transform ${bgColors} ${
                        isCircle ? 'rounded-full' : 'rounded-card'
                      } ${draggingTableId === table._id ? 'scale-105 shadow-premium ring-2 ring-primary/45' : ''}`}
                      style={{
                        left: `${table.position.x}px`,
                        top: `${table.position.y}px`,
                        width: `${table.size?.width || 80}px`,
                        height: `${table.size?.height || 80}px`,
                      }}
                    >
                      <span className="font-bold text-xs">#{table.number}</span>
                      <div className="flex items-center text-[9px] mt-1 opacity-70">
                        <Users className="h-3 w-3 mr-0.5" /> {table.capacity}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Active Bookings Lists side panel */}
          <div className="space-y-6">
            <Card className="space-y-4">
              <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center">
                <Clock className="h-4.5 w-4.5 mr-1.5 text-primary" /> Tomorrow's Bookings
              </h4>
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {reservations.length === 0 ? (
                  <p className="text-[10px] text-slate-400 font-semibold text-center py-4">No upcoming bookings logged.</p>
                ) : (
                  reservations.map(res => (
                    <div key={res._id} className="p-3 border border-slate-100 dark:border-zinc-900 bg-slate-50/50 dark:bg-zinc-900/30 rounded-card space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-800 dark:text-zinc-100">{res.customerName}</p>
                          <p className="text-[10px] text-slate-400">{res.customerPhone}</p>
                        </div>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-pill capitalize ${
                          res.status === 'confirmed' ? 'bg-blue-100 text-blue-600 dark:bg-blue-950/20' :
                          res.status === 'seated' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/20' :
                          'bg-slate-100 text-slate-500'
                        }`}>
                          {res.status}
                        </span>
                      </div>
                      
                      <div className="flex justify-between text-[10px] text-slate-400 border-t border-slate-100 dark:border-zinc-800 pt-1.5">
                        <span>Guests: {res.partySize}</span>
                        <span>Table: #{res.tableId?.number || '—'}</span>
                      </div>

                      {res.status === 'confirmed' && (
                        <div className="flex justify-end pt-1">
                          <Button 
                            onClick={() => handleSeatCustomer(res._id)}
                            variant="primary" 
                            size="sm" 
                            className="text-[9px] font-bold px-2 py-0.5"
                          >
                            Seat Guest
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal Book Reservation */}
      {showAddBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-100 dark:bg-zinc-950 dark:border-zinc-900 w-full max-w-sm rounded-card p-6 shadow-premium space-y-4 animate-scale-in">
            <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100 flex items-center">
              <Calendar className="h-4.5 w-4.5 mr-2 text-primary" /> Book Guest Reservation
            </h3>
            <form onSubmit={handleAddBooking} className="space-y-4">
              <Input 
                label="Customer Name" 
                value={newBooking.customerName} 
                onChange={(e) => setNewBooking(prev => ({ ...prev, customerName: e.target.value }))}
                required 
              />
              <Input 
                label="Customer Phone" 
                value={newBooking.customerPhone} 
                onChange={(e) => setNewBooking(prev => ({ ...prev, customerPhone: e.target.value }))}
                required 
              />
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Party Size" 
                  type="number"
                  value={newBooking.partySize} 
                  onChange={(e) => setNewBooking(prev => ({ ...prev, partySize: parseInt(e.target.value, 10) || 2 }))}
                  required 
                />
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Table Mapping</label>
                  <select
                    value={newBooking.tableId}
                    onChange={(e) => setNewBooking(prev => ({ ...prev, tableId: e.target.value }))}
                    className="px-3 py-2 text-xs border bg-white border-slate-350 rounded-input focus:outline-none dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200"
                  >
                    <option value="">Select table</option>
                    {tables.map(t => (
                      <option key={t._id} value={t._id}>Table #{t.number} (Seats {t.capacity})</option>
                    ))}
                  </select>
                </div>
              </div>
              <Input 
                label="Reservation Date/Time" 
                type="datetime-local"
                value={newBooking.reservationTime} 
                onChange={(e) => setNewBooking(prev => ({ ...prev, reservationTime: e.target.value }))}
                required 
              />
              <Input 
                label="Special Requests notes" 
                value={newBooking.notes} 
                onChange={(e) => setNewBooking(prev => ({ ...prev, notes: e.target.value }))}
              />
              <div className="flex justify-end space-x-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setShowAddBooking(false)}>Cancel</Button>
                <Button type="submit" variant="primary" size="sm">Book Guest</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ReservationsPage;
