import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setSearchQuery } from '../../store/uiSlice';
import { ShieldAlert, RotateCw, Search, Loader2, AlertCircle } from 'lucide-react';
import api from '../../utils/api';

export default function ActivityLogs() {
  const dispatch = useDispatch();
  const { searchQuery } = useSelector((state) => state.ui);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [actionFilter, setActionFilter] = useState('');

  const loadLogs = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/reports/activity-logs');
      setLogs(data);
    } catch (err) {
      console.error('Failed to load activity logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  // Filter logs locally based on search query & dropdown selection
  const filteredLogs = logs.filter((log) => {
    const matchesSearch = 
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = actionFilter === '' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  // Extract unique action types for filter dropdown
  const actionTypes = [...new Set(logs.map(l => l.action))];

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div className="flex items-center justify-between border-b pb-4 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Activity Logs</h1>
          <p className="text-sm text-slate-500">Audit trail of actions performed by your business employees</p>
        </div>
        <button
          onClick={loadLogs}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 px-4 py-2 text-xs font-semibold"
        >
          <RotateCw className="h-4 w-4 text-slate-500" />
          Refresh Logs
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              className="w-full sm:w-60 rounded-xl bg-white dark:bg-slate-900 border pl-10 pr-4 py-2 text-xs outline-none focus:border-brand-500 transition-all text-slate-800 dark:text-slate-200"
            />
          </div>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs outline-none"
          >
            <option value="">All Actions</option>
            {actionTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* DATA VIEW */}
      {loading ? (
        <div className="flex h-60 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        </div>
      ) : (
        <div className="glass-card p-6 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
              <thead>
                <tr className="border-b dark:border-slate-800 text-slate-400 font-semibold">
                  <th className="pb-3">Timestamp</th>
                  <th className="pb-3">Employee</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Action</th>
                  <th className="pb-3">Description</th>
                  <th className="pb-3">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-slate-400">
                      <div className="flex flex-col items-center gap-2 py-4">
                        <AlertCircle className="h-8 w-8 text-slate-350" />
                        <span>No activity logs found.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-100/50 dark:hover:bg-slate-900/30">
                      <td className="py-3.5 text-slate-400">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3.5 font-semibold text-slate-800 dark:text-slate-200">
                        {log.userName}
                      </td>
                      <td className="py-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800">
                          {log.userRole}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <span className="px-2 py-0.5 rounded font-bold text-[9px] bg-brand-500/10 text-brand-600 dark:text-brand-400 uppercase">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3.5 text-slate-700 dark:text-slate-300">{log.details}</td>
                      <td className="py-3.5 font-mono text-[10px]">{log.ipAddress || 'unknown'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
