import React from 'react';
import { useSelector } from 'react-redux';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

// Custom tooltip card with theme styles
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-slate-100 rounded-card shadow-premium dark:bg-zinc-900 dark:border-zinc-800 text-xs">
        <p className="font-bold text-slate-800 dark:text-zinc-200">{label}</p>
        {payload.map((item) => (
          <p key={item.name} className="font-semibold" style={{ color: item.color }}>
            {item.name}: ${item.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// 1. AREA CHART: Sales & Revenue curve
export const SalesAreaChart = () => {
  const theme = useSelector((state) => state.ui.theme);
  const isDark = theme === 'dark';

  const data = [
    { name: '08:00', sales: 420, orders: 12 },
    { name: '10:00', sales: 850, orders: 24 },
    { name: '12:00', sales: 2400, orders: 58 },
    { name: '14:00', sales: 1800, orders: 42 },
    { name: '16:00', sales: 980, orders: 20 },
    { name: '18:00', sales: 3100, orders: 74 },
    { name: '20:00', sales: 4500, orders: 98 },
    { name: '22:00', sales: 1200, orders: 28 },
  ];

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#27272a' : '#f1f5f9'} />
          <XAxis 
            dataKey="name" 
            stroke={isDark ? '#71717a' : '#94a3b8'} 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis 
            stroke={isDark ? '#71717a' : '#94a3b8'} 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="sales" 
            name="Revenue" 
            stroke="#10b981" 
            strokeWidth={2} 
            fillOpacity={1} 
            fill="url(#colorSales)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// 2. BAR CHART: Top dishes by revenue
export const MenuPerformanceBarChart = () => {
  const theme = useSelector((state) => state.ui.theme);
  const isDark = theme === 'dark';

  const data = [
    { name: 'Truffle Pasta', revenue: 1850 },
    { name: 'Ribeye Steak', revenue: 3200 },
    { name: 'Burger & Fries', revenue: 1450 },
    { name: 'Ceasar Salad', revenue: 980 },
    { name: 'Salmon Bowl', revenue: 2100 },
  ];

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#27272a' : '#f1f5f9'} />
          <XAxis 
            dataKey="name" 
            stroke={isDark ? '#71717a' : '#94a3b8'} 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis 
            stroke={isDark ? '#71717a' : '#94a3b8'} 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="revenue" name="Sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// 3. PIE CHART: Orders Channels distribution
export const OrdersDistributionPieChart = () => {
  const theme = useSelector((state) => state.ui.theme);
  const isDark = theme === 'dark';

  const data = [
    { name: 'Dine-In', value: 45 },
    { name: 'Delivery', value: 35 },
    { name: 'Takeaway', value: 20 },
  ];

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b'];

  return (
    <div className="h-64 w-full flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconSize={8} 
            iconType="circle"
            formatter={(value) => <span className="text-xs font-semibold text-slate-600 dark:text-zinc-400">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
