import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import api from '../../services/api';
import Skeleton from '../../components/ui/Skeleton';
import { 
  SalesAreaChart, 
  MenuPerformanceBarChart, 
  OrdersDistributionPieChart 
} from '../../components/charts/DashboardCharts';
import { 
  TrendingUp, 
  Users, 
  ChefHat, 
  AlertTriangle, 
  ArrowUpRight, 
  Clock, 
  Calendar,
  Layers,
  ChevronRight,
  Coffee,
  Play,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    todaySales: 0,
    occupiedTables: 0,
    totalTables: 0,
    kitchenOrders: 0,
    lowStockItems: 0
  });
  const [salesTrend, setSalesTrend] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [orderDistribution, setOrderDistribution] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  
  // Manager-specific state
  const [roster, setRoster] = useState([]);

  // Real-time clock refresh
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const statsRes = await api.get('/restaurant/dashboard');
        setStats(statsRes.data.data);

        const salesRes = await api.get('/reports/sales');
        setSalesTrend(salesRes.data.data?.revenueByDay || []);

        const itemsRes = await api.get('/reports/top-items?limit=5');
        setTopItems(itemsRes.data.data?.items || []);

        const ordersRes = await api.get('/orders');
        const orders = ordersRes.data.data?.items || [];
        
        const dineIn = orders.filter(o => o.orderType === 'dine_in').length;
        const delivery = orders.filter(o => o.orderType === 'delivery').length;
        const takeaway = orders.filter(o => o.orderType === 'takeaway').length;
        setOrderDistribution([
          { name: 'Dine-In', value: dineIn },
          { name: 'Delivery', value: delivery },
          { name: 'Takeaway', value: takeaway },
        ]);

        const mappedEvents = orders.slice(0, 4).map(o => {
          const relativeTime = new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          return {
            id: o._id,
            action: `Order #${o.orderNumber} is ${o.status}`,
            user: o.customerDetails?.name || 'Customer',
            time: relativeTime
          };
        });
        setRecentEvents(mappedEvents);

        // Fetch roster if branch manager
        if (user?.role === 'branch_manager') {
          const todayStr = new Date().toISOString().slice(0, 10);
          const rosterRes = await api.get(`/attendance/roster?date=${todayStr}`);
          setRoster(rosterRes.data.data.roster || []);
        }
      } catch (err) {
        console.error('Error loading dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const getGreeting = () => {
    const hour = time.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTimeOnly = (dateStr) => {
    if (!dateStr) return '--:--';
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Staff on shift calculations
  const activeStaffCount = roster.filter(r => r.attendance && !r.attendance.clockOut).length;
  const breakStaffCount = roster.filter(r => r.attendance && r.attendance.breaks.some(b => b.end === null)).length;

  const renderManagerDashboard = () => {
    const managerKpis = [
      {
        title: "Active Occupancy",
        value: `${stats.occupiedTables} / ${stats.totalTables} Tables`,
        change: `${stats.totalTables ? Math.round((stats.occupiedTables / stats.totalTables) * 100) : 0}% Full`,
        changeType: "neutral",
        icon: Users,
        iconClass: "bg-blue-100 text-blue-600 dark:bg-blue-950/30 dark:text-blue-500",
        path: "/reservations",
      },
      {
        title: "Kitchen Queue",
        value: `${stats.kitchenOrders} Cooking`,
        change: "Active tickets",
        changeType: "warning",
        icon: ChefHat,
        iconClass: "bg-purple-100 text-purple-600 dark:bg-purple-950/30 dark:text-purple-500",
        path: "/kitchen",
      },
      {
        title: "Staff On Duty",
        value: `${activeStaffCount} Active`,
        change: breakStaffCount > 0 ? `${breakStaffCount} on break` : "All on shift",
        changeType: breakStaffCount > 0 ? "warning" : "up",
        icon: Users,
        iconClass: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-500",
        path: "/attendance",
      },
      {
        title: "Inventory Alert",
        value: `${stats.lowStockItems} Items Low`,
        change: stats.lowStockItems > 0 ? "Needs ordering" : "Fully stocked",
        changeType: stats.lowStockItems > 0 ? "danger" : "neutral",
        icon: AlertTriangle,
        iconClass: "bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-500",
        path: "/inventory",
      },
    ];

    return (
      <div className="space-y-6">
        {/* Banner */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-6 rounded-card shadow-soft space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-zinc-50">
              {getGreeting()}, {user?.name || 'Manager'}
            </h1>
            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1 font-semibold">
              Manager Operations Center • Branch: <span className="text-primary font-bold">London Central</span>
            </p>
          </div>
          
          <div className="flex items-center space-x-4 border-l border-slate-100 dark:border-zinc-800 pl-0 md:pl-6">
            <div className="p-2 bg-slate-50 dark:bg-zinc-800/50 rounded-card text-slate-400 dark:text-zinc-500">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-800 dark:text-zinc-200">{formatTime(time)}</div>
              <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold uppercase">{formatDate(time)}</div>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {managerKpis.map((kpi) => (
            <Card key={kpi.title} onClick={() => navigate(kpi.path)} className="flex items-center justify-between cursor-pointer hover:shadow-premium transition-all">
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500">{kpi.title}</span>
                <h3 className="text-xl font-bold text-slate-800 dark:text-zinc-100">{kpi.value}</h3>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-pill inline-block ${
                  kpi.changeType === 'up' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-500' :
                  kpi.changeType === 'danger' ? 'bg-red-100 text-red-600 dark:bg-red-950/20 dark:text-red-500' :
                  kpi.changeType === 'warning' ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/20 dark:text-amber-500' :
                  'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400'
                }`}>{kpi.change}</span>
              </div>
              <div className={`p-3 rounded-card shrink-0 ${kpi.iconClass}`}>
                <kpi.icon className="h-5 w-5" />
              </div>
            </Card>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Staff Shift Monitor widget */}
          <Card className="lg:col-span-2 space-y-4 border border-slate-100 dark:border-zinc-900">
            <div className="flex justify-between items-center pb-2 border-b border-slate-50 dark:border-zinc-900">
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200">Staff Shift Monitor</h4>
                <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold">Real-time duty logs for branch employees</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/attendance')}>
                Attendance Center <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-zinc-850 text-slate-400 font-bold">
                    <th className="py-2">Employee</th>
                    <th className="py-2">Role</th>
                    <th className="py-2">Shift Time</th>
                    <th className="py-2">Status</th>
                    <th className="py-2 text-right">Clock In</th>
                  </tr>
                </thead>
                <tbody>
                  {roster.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-slate-450 font-semibold">No roster data available for today.</td>
                    </tr>
                  ) : (
                    roster.slice(0, 5).map((item) => {
                      const hasCheckedIn = !!item.attendance;
                      let statusBadge = (
                        <span className="px-1.5 py-0.5 rounded-pill text-[9px] font-bold bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400 uppercase">
                          Absent
                        </span>
                      );
                      
                      if (hasCheckedIn) {
                        if (item.attendance.clockOut) {
                          statusBadge = (
                            <span className="px-1.5 py-0.5 rounded-pill text-[9px] font-bold bg-slate-100 text-slate-500 uppercase">
                              Ended
                            </span>
                          );
                        } else if (item.attendance.breaks.some(b => b.end === null)) {
                          statusBadge = (
                            <span className="px-1.5 py-0.5 rounded-pill text-[9px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400 uppercase">
                              On Break
                            </span>
                          );
                        } else {
                          statusBadge = (
                            <span className="px-1.5 py-0.5 rounded-pill text-[9px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 uppercase">
                              Active
                            </span>
                          );
                        }
                      }

                      return (
                        <tr key={item.employee._id} className="border-b border-slate-50 dark:border-zinc-900/40 text-slate-650 dark:text-zinc-300">
                          <td className="py-2.5 font-bold text-slate-800 dark:text-zinc-200">{item.employee.name}</td>
                          <td className="py-2.5 capitalize text-[10px] font-semibold text-slate-450">{item.employee.role}</td>
                          <td className="py-2.5 font-mono">{item.employee.shift?.start} - {item.employee.shift?.end}</td>
                          <td className="py-2.5">{statusBadge}</td>
                          <td className="py-2.5 text-right font-mono">{hasCheckedIn ? formatTimeOnly(item.attendance.clockIn) : '--:--'}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Channels distribution */}
          <Card className="space-y-4 border border-slate-100 dark:border-zinc-900">
            <div className="pb-2 border-b border-slate-50 dark:border-zinc-900">
              <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200">Active Order Channels</h4>
              <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold">Today's active order channels</p>
            </div>
            <OrdersDistributionPieChart data={orderDistribution} />
          </Card>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top dishes */}
          <Card className="lg:col-span-2 space-y-4 border border-slate-100 dark:border-zinc-900">
            <div className="pb-2 border-b border-slate-50 dark:border-zinc-900">
              <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200">Top Performing Dishes</h4>
              <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold">Branch menu item sales</p>
            </div>
            <MenuPerformanceBarChart data={topItems} />
          </Card>

          {/* System events */}
          <Card className="space-y-4 border border-slate-100 dark:border-zinc-900">
            <div className="pb-2 border-b border-slate-50 dark:border-zinc-900">
              <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200">Live Operation Feed</h4>
              <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold">Live order and reservation triggers</p>
            </div>
            
            <div className="space-y-3.5">
              {recentEvents.map((evt) => (
                <div key={evt.id} className="flex justify-between items-start text-xs border-b border-slate-50 dark:border-zinc-900/50 pb-2.5 last:border-b-0 last:pb-0">
                  <div className="space-y-0.5 max-w-[70%]">
                    <p className="font-semibold text-slate-800 dark:text-zinc-200 truncate">{evt.action}</p>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold">Trigger: {evt.user}</p>
                  </div>
                  <span className="text-[9px] text-slate-400 dark:text-zinc-500 shrink-0 font-medium">{evt.time}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  };

  const renderOwnerDashboard = () => {
    const kpis = [
      {
        title: "Today's Sales",
        value: `$${(stats.todaySales || 0).toFixed(2)}`,
        change: "Live updates",
        changeType: "up",
        icon: TrendingUp,
        iconClass: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-500",
        path: "/reports",
      },
      {
        title: "Active Occupancy",
        value: `${stats.occupiedTables} / ${stats.totalTables} Tables`,
        change: `${stats.totalTables ? Math.round((stats.occupiedTables / stats.totalTables) * 100) : 0}% Full`,
        changeType: "neutral",
        icon: Users,
        iconClass: "bg-blue-100 text-blue-600 dark:bg-blue-950/30 dark:text-blue-500",
        path: "/reservations",
      },
      {
        title: "Kitchen Queue",
        value: `${stats.kitchenOrders} Cooking`,
        change: "Active tickets",
        changeType: "warning",
        icon: ChefHat,
        iconClass: "bg-purple-100 text-purple-600 dark:bg-purple-950/30 dark:text-purple-500",
        path: "/kitchen",
      },
      {
        title: "Inventory Alert",
        value: `${stats.lowStockItems} Items Low`,
        change: stats.lowStockItems > 0 ? "Needs ordering" : "Fully stocked",
        changeType: stats.lowStockItems > 0 ? "danger" : "neutral",
        icon: AlertTriangle,
        iconClass: "bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-500",
        path: "/inventory",
      },
    ];

    return (
      <div className="space-y-6">
        {/* Dynamic header welcome banner & Clock */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-6 rounded-card shadow-soft space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-zinc-50">
              {getGreeting()}, {user?.name || 'User'}
            </h1>
            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1 font-semibold">
              Role: <span className="uppercase text-primary">{user?.role}</span> • Restaurant branch location: London Central
            </p>
          </div>
          
          {/* Clock Widget */}
          <div className="flex items-center space-x-4 border-l border-slate-100 dark:border-zinc-800 pl-0 md:pl-6">
            <div className="p-2 bg-slate-50 dark:bg-zinc-800/50 rounded-card text-slate-400 dark:text-zinc-500">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                {formatTime(time)}
              </div>
              <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold uppercase">
                {formatDate(time)}
              </div>
            </div>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {kpis.map((kpi) => (
            <Card key={kpi.title} onClick={() => navigate(kpi.path)} className="flex items-center justify-between cursor-pointer hover:shadow-premium transition-all">
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500 font-medium">
                  {kpi.title}
                </span>
                <h3 className="text-xl font-bold text-slate-800 dark:text-zinc-100">
                  {kpi.value}
                </h3>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-pill inline-block ${
                  kpi.changeType === 'up' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-500' :
                  kpi.changeType === 'danger' ? 'bg-red-100 text-red-600 dark:bg-red-950/20 dark:text-red-500' :
                  kpi.changeType === 'warning' ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/20 dark:text-amber-500' :
                  'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400'
                }`}>
                  {kpi.change}
                </span>
              </div>
              <div className={`p-3 rounded-card shrink-0 ${kpi.iconClass}`}>
                <kpi.icon className="h-5 w-5" />
              </div>
            </Card>
          ))}
        </div>

        {/* Analytics Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Sales Curve */}
          <Card className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-50 dark:border-zinc-900">
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200">Revenue Stream Today</h4>
                <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold">Real-time update intervals (Socket.IO)</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/reports')}>
                Full Report <ArrowUpRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
            <SalesAreaChart data={salesTrend} />
          </Card>

          {/* Orders Channels Distribution */}
          <Card className="space-y-4">
            <div className="pb-2 border-b border-slate-50 dark:border-zinc-900">
              <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200">Orders Distribution</h4>
              <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold">Today's active order channels</p>
            </div>
            <OrdersDistributionPieChart data={orderDistribution} />
          </Card>
        </div>

        {/* Bottom Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Menu Performance */}
          <Card className="lg:col-span-2 space-y-4">
            <div className="pb-2 border-b border-slate-50 dark:border-zinc-900">
              <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200">Top Performing Items</h4>
              <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold">Best-selling dishes measured by revenue contribution</p>
            </div>
            <MenuPerformanceBarChart data={topItems} />
          </Card>

          {/* Real-time Activity Feed */}
          <Card className="space-y-4">
            <div className="pb-2 border-b border-slate-50 dark:border-zinc-900">
              <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200">System Activity Feed</h4>
              <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold">Live operations transactions updates</p>
            </div>
            
            <div className="space-y-3.5">
              {recentEvents.map((evt) => (
                <div key={evt.id} className="flex justify-between items-start text-xs border-b border-slate-50 dark:border-zinc-900/50 pb-2.5 last:border-b-0 last:pb-0">
                  <div className="space-y-0.5 max-w-[70%]">
                    <p className="font-semibold text-slate-800 dark:text-zinc-200 truncate">{evt.action}</p>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold">Triggered by: {evt.user}</p>
                  </div>
                  <span className="text-[9px] text-slate-400 dark:text-zinc-500 shrink-0 font-medium">{evt.time}</span>
                </div>
              ))}
            </div>

            <Button variant="text" size="sm" className="w-full text-center text-xs mt-2 border border-slate-100 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900" onClick={() => navigate('/orders')}>
              View Activity Logs <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      {loading ? (
        <div className="space-y-6">
          <Skeleton variant="rectangular" height={100} className="rounded-card" />
          <div className="grid grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => <Skeleton key={i} variant="rectangular" height={100} className="rounded-card" />)}
          </div>
          <div className="grid grid-cols-3 gap-6">
            <Skeleton variant="rectangular" height={300} className="col-span-2 rounded-card" />
            <Skeleton variant="rectangular" height={300} className="rounded-card" />
          </div>
        </div>
      ) : user?.role === 'branch_manager' ? (
        renderManagerDashboard()
      ) : (
        renderOwnerDashboard()
      )}
    </DashboardLayout>
  );
};

export default DashboardPage;
