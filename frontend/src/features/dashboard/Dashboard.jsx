import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  DollarSign, Package, Users, AlertTriangle, 
  ArrowUpRight, ArrowDownRight, TrendingUp, ShoppingBag, Landmark
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts';
import api from '../../utils/api';

const COLORS = ['#8b5cf6', '#a855f7', '#c084fc', '#e9d5ff', '#ddd6fe'];

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/reports/dashboard');
        setData(response.data);
      } catch (err) {
        console.error('Error fetching dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Skeleton Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="h-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 lg:col-span-2" />
          <div className="h-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40" />
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const recentOrders = data?.recentOrders || [];
  const topSelling = data?.topSellingProducts || [];
  const chartData = data?.salesChartData || [];

  // Group top selling for pie chart
  const pieData = topSelling.map(p => ({
    name: p.name,
    value: p.revenue
  }));

  const cardData = [
    { 
      name: "Today's Sales", 
      value: `Rs. ${(metrics.todaySales || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
      sub: `${metrics.todayCount || 0} orders today`,
      icon: DollarSign, 
      color: "from-emerald-500/20 to-teal-500/5 text-emerald-600 dark:text-emerald-400" 
    },
    { 
      name: "Monthly Profit", 
      value: `Rs. ${(metrics.monthlyProfit || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
      sub: `Revenue: Rs. ${(metrics.monthlySales || 0).toLocaleString()}`,
      icon: TrendingUp, 
      color: "from-brand-500/20 to-purple-500/5 text-brand-600 dark:text-brand-400" 
    },
    { 
      name: "Inventory Value", 
      value: `Rs. ${(metrics.inventoryValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
      sub: `${metrics.totalProducts || 0} items active`,
      icon: Package, 
      color: "from-violet-500/20 to-indigo-500/5 text-violet-600 dark:text-violet-400" 
    },
    { 
      name: "Low Stock Items", 
      value: metrics.lowStockCount || 0, 
      sub: "Needs urgent reorder",
      icon: AlertTriangle, 
      color: metrics.lowStockCount > 0 ? "from-red-500/20 to-orange-500/5 text-red-600 dark:text-red-400" : "from-slate-500/20 to-slate-500/5 text-slate-500" 
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div>
        <h1 className="text-lg font-bold tracking-tight text-slate-850 dark:text-slate-100">Overview Dashboard</h1>
        <p className="text-xs text-slate-500 mt-0.5">Real-time metrics and store health analytics</p>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cardData.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.name} className="glass-card p-6 flex items-center justify-between shadow-sm">
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{card.name}</span>
                <h3 className="text-base font-extrabold tracking-tight whitespace-nowrap">{card.value}</h3>
                <span className="text-xs text-slate-500 block">{card.sub}</span>
              </div>
              <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Sales Trend Chart */}
        <div className="glass-card p-6 lg:col-span-2 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h4 className="text-sm font-semibold">Sales & Profit Trends</h4>
            <p className="text-xs text-slate-500">Overview of transactions in the last 15 days</p>
          </div>
          <div className="h-72 w-full">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">No transaction history recorded yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                  <XAxis dataKey="_id" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      background: 'rgba(15, 23, 42, 0.9)', 
                      border: 'none', 
                      fontSize: '11px'
                    }} 
                    itemStyle={{ color: '#ffffff' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Area type="monotone" dataKey="sales" name="Revenue" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                  <Area type="monotone" dataKey="profit" name="Profit" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top Product share */}
        <div className="glass-card p-6 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h4 className="text-sm font-semibold">Top Selling Revenue</h4>
            <p className="text-xs text-slate-500">Distribution of top products by revenue</p>
          </div>
          <div className="h-72 w-full relative flex flex-col justify-center items-center">
            {pieData.length === 0 ? (
              <div className="text-xs text-slate-400">No sales recorded yet</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height="80%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '12px', 
                        background: 'rgba(15, 23, 42, 0.9)', 
                        border: 'none', 
                        fontSize: '11px' 
                      }} 
                      itemStyle={{ color: '#ffffff' }}
                      labelStyle={{ color: '#94a3b8' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Custom Legend */}
                <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-2">
                  {pieData.map((item, idx) => (
                    <div key={item.name} className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span className="text-[10px] text-slate-500 truncate max-w-20">{item.name}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

      </div>

      {/* LOWER SECTION: RECENT SALES TABLE & DETAILS */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Recent Transactions List */}
        <div className="glass-card p-6 lg:col-span-2 shadow-sm">
          <div className="flex items-center justify-between border-b pb-4 mb-4 dark:border-slate-800">
            <div>
              <h4 className="text-sm font-semibold">Recent Sales Invoices</h4>
              <p className="text-xs text-slate-500">List of latest orders checked out on terminals</p>
            </div>
            <Link to="/reports" className="flex items-center gap-1 text-xs text-brand-500 hover:text-brand-400 font-semibold transition-colors">
              View History
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
              <thead>
                <tr className="border-b dark:border-slate-800 text-slate-400 font-semibold">
                  <th className="pb-3">Invoice</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Cashier</th>
                  <th className="pb-3">Method</th>
                  <th className="pb-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-6 text-slate-400">No checkout transactions completed yet.</td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-slate-100/50 dark:hover:bg-slate-900/30">
                      <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">{order.invoiceNumber}</td>
                      <td className="py-3">{order.customerId?.name || 'Walk-in Guest'}</td>
                      <td className="py-3">{order.cashierId?.name || 'Staff'}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px]">
                          {order.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 text-right font-semibold text-slate-800 dark:text-slate-200">
                        Rs. {(order.totalAmount || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products Lists */}
        <div className="glass-card p-6 shadow-sm">
          <div className="border-b pb-4 mb-4 dark:border-slate-800">
            <h4 className="text-sm font-semibold">Top Selling Items</h4>
            <p className="text-xs text-slate-500">Ranked by unit sales volume</p>
          </div>
          <div className="space-y-4">
            {topSelling.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No products sold yet</p>
            ) : (
              topSelling.map((prod, index) => (
                <div key={prod._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-500">
                      #{index + 1}
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200">{prod.name}</span>
                      <span className="block text-[10px] text-slate-500">{prod.sku}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200">{prod.quantity} units</span>
                    <span className="block text-[10px] text-slate-500">Rs. {(prod.revenue || 0).toFixed(2)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
