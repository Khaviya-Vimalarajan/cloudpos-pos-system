import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Building2, Users, DollarSign, ShieldAlert, Check, XCircle, 
  RotateCw, ShieldCheck, Loader2, PieChart as ChartIcon
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import api from '../../utils/api';

const COLORS = ['#8b5cf6', '#10b981', '#ef4444'];

export default function Admin() {
  const location = useLocation();
  const isLogsTab = location.pathname === '/admin/logs';
  const { searchQuery } = useSelector((state) => state.ui);

  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [logs, setLogs] = useState([]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [tenantsRes, metricsRes, logsRes] = await Promise.all([
        api.get('/admin/tenants'),
        api.get('/admin/metrics'),
        api.get('/admin/logs')
      ]);
      setTenants(tenantsRes.data);
      setMetrics(metricsRes.data.metrics);
      setSubscriptions(metricsRes.data.subscriptions);
      setLogs(logsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleStatusChange = async (tenantId, newStatus) => {
    const confirmMsg = `Are you sure you want to change this business status to '${newStatus}'?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await api.put(`/admin/tenants/${tenantId}/status`, { status: newStatus });
      alert('Business status updated successfully.');
      loadAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating status');
    }
  };

  const filteredTenants = tenants.filter(ten => 
    ten.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (ten.ownerName && ten.ownerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (ten.ownerEmail && ten.ownerEmail.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredLogs = logs.filter(log => 
    log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.details.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  // Format subscription stats for Recharts
  const pieData = subscriptions.map((s, idx) => ({
    name: s._id || 'Free',
    value: s.count
  }));

  const cardData = [
    { name: "Total Businesses", value: metrics?.totalBusinesses || 0, icon: Building2, color: "from-brand-500/20 text-brand-500" },
    { name: "Platform Users", value: metrics?.totalUsers || 0, icon: Users, color: "from-blue-500/20 text-blue-500" },
    { name: "Transaction Volume", value: `Rs. ${(metrics?.totalSalesVolume || 0).toLocaleString()}`, icon: DollarSign, color: "from-emerald-500/20 text-emerald-500" },
    { name: "Platform Net Profit", value: `Rs. ${(metrics?.totalPlatformProfit || 0).toLocaleString()}`, icon: ShieldCheck, color: "from-indigo-500/20 text-indigo-500" }
  ];

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div className="flex items-center justify-between border-b pb-4 dark:border-slate-800">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-850 dark:text-slate-100">SaaS Console (Super Admin)</h1>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">Overview of registered business tenants, subscription distribution models, and billing metrics</p>
        </div>
        <button
          onClick={loadAdminData}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 px-4 py-2 text-xs font-semibold"
        >
          <RotateCw className="h-4 w-4 text-slate-500" />
          Refresh Console
        </button>
      </div>

      {/* METRIC GRID */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cardData.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.name} className="glass-card p-6 flex items-center justify-between shadow-sm">
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{card.name}</span>
                <h3 className="text-base font-extrabold tracking-tight">{card.value}</h3>
              </div>
              <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* BOTTOM DISPLAY: SWAPPED BY ACTIVE SUB-ROUTE */}
      {isLogsTab ? (
        <div className="glass-card p-6 shadow-sm overflow-hidden">
          <div className="border-b pb-4 mb-4 dark:border-slate-800">
            <h4 className="text-sm font-semibold">System Audit Trail</h4>
            <p className="text-xs text-slate-500">Log of platform configuration and security actions across all tenants</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
              <thead>
                <tr className="border-b dark:border-slate-800 text-slate-400 font-semibold">
                  <th className="pb-3">Timestamp</th>
                  <th className="pb-3">User</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Action</th>
                  <th className="pb-3">Details</th>
                  <th className="pb-3">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-6 text-slate-400">No system audit logs found.</td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-100/50 dark:hover:bg-slate-900/30">
                      <td className="py-3 text-[10px] text-slate-400">{new Date(log.createdAt).toLocaleString()}</td>
                      <td className="py-3 font-bold text-slate-850 dark:text-slate-200">{log.userName}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800">
                          {log.userRole}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded font-bold text-[9px] bg-brand-500/10 text-brand-600 dark:text-brand-400 uppercase">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3">{log.details}</td>
                      <td className="py-3 font-mono text-[10px]">{log.ipAddress || 'unknown'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tenants Table (2 cols) */}
          <div className="lg:col-span-2 glass-card p-6 shadow-sm overflow-hidden">
            <div className="border-b pb-4 mb-4 dark:border-slate-800">
              <h4 className="text-sm font-semibold">Registered Businesses</h4>
              <p className="text-xs text-slate-500">List of all companies configured on CloudPOS platform</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
                <thead>
                  <tr className="border-b dark:border-slate-800 text-slate-400 font-semibold">
                    <th className="pb-3">Business</th>
                    <th className="pb-3">Owner Contact</th>
                    <th className="pb-3">Plan</th>
                    <th className="pb-3">Stats</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {filteredTenants.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-6 text-slate-400">No registered businesses found.</td>
                    </tr>
                  ) : (
                    filteredTenants.map((ten) => (
                      <tr key={ten._id} className="hover:bg-slate-100/50 dark:hover:bg-slate-900/30">
                        <td className="py-3">
                          <span className="block font-bold text-slate-850 dark:text-slate-200">{ten.name}</span>
                          <span className="block text-[8px] text-slate-450">ID: {ten._id}</span>
                        </td>
                        <td className="py-3">
                          <span className="block">{ten.ownerName}</span>
                          <span className="block text-[10px] text-slate-500">{ten.ownerEmail}</span>
                        </td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold text-[9px] uppercase">
                            {ten.subscriptionPlan}
                          </span>
                        </td>
                        <td className="py-3 text-[10px] text-slate-500">
                          <div>Users: {ten.usersCount}</div>
                          <div>Orders: {ten.ordersCount}</div>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${
                            ten.status === 'active' 
                              ? 'bg-emerald-500/10 text-emerald-500' 
                              : 'bg-red-500/10 text-red-500'
                          }`}>
                            {ten.status}
                          </span>
                        </td>
                        <td className="py-3 text-center">
                          {ten.status === 'active' ? (
                            <button
                              onClick={() => handleStatusChange(ten._id, 'suspended')}
                              className="flex items-center gap-1 rounded-lg border border-red-500/20 bg-red-500/5 text-red-500 px-2 py-1 mx-auto hover:bg-red-500/15"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              Suspend
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStatusChange(ten._id, 'active')}
                              className="flex items-center gap-1 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-emerald-600 px-2 py-1 mx-auto hover:bg-emerald-500/15"
                            >
                              <Check className="h-3.5 w-3.5" />
                              Activate
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Subscription breakdown Pie Chart */}
          <div className="glass-card p-6 shadow-sm flex flex-col justify-between">
            <div className="mb-4">
              <h4 className="text-sm font-semibold">Subscription Distributions</h4>
              <p className="text-xs text-slate-500">Proportions of tenants by plans</p>
            </div>
            <div className="h-64 w-full flex flex-col justify-center items-center">
              {pieData.length === 0 ? (
                <p className="text-xs text-slate-400">No tenants active</p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height="80%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
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
                          color: 'white',
                          fontSize: '11px' 
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Custom Legend */}
                  <div className="flex gap-4 mt-2">
                    {pieData.map((item, idx) => (
                      <div key={item.name} className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                        <span className="text-[10px] text-slate-500">{item.name} ({item.value})</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
