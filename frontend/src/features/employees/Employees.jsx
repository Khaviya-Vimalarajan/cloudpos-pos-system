import React, { useState, useEffect } from 'react';
import { User, Plus, Trash2, Edit2, Shield, UserCheck, UserX, Loader2 } from 'lucide-react';
import api from '../../utils/api';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Cashier');
  const [status, setStatus] = useState('active');

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/employees');
      setEmployees(data);
    } catch (err) {
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEmployee) {
        // Update Employee
        const { data } = await api.put(`/employees/${editingEmployee._id}`, {
          name, email, role, status
        });
        setEmployees(employees.map(emp => emp._id === editingEmployee._id ? data : emp));
      } else {
        // Create Employee
        const { data } = await api.post('/employees', {
          name, email, password, role
        });
        setEmployees([...employees, data]);
      }
      handleCloseModal();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed.');
    }
  };

  const handleEditClick = (emp) => {
    setEditingEmployee(emp);
    setName(emp.name);
    setEmail(emp.email);
    setRole(emp.role);
    setStatus(emp.status);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee account?')) {
      try {
        await api.delete(`/employees/${id}`);
        setEmployees(employees.filter(emp => emp._id !== id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEmployee(null);
    setName('');
    setEmail('');
    setPassword('');
    setRole('Cashier');
    setStatus('active');
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-850 dark:text-slate-100">Staff Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">Add and manage cashier and inventory manager access accounts</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-brand-500 text-white font-semibold text-xs px-4 py-2.5 shadow-lg shadow-brand-500/25 hover:bg-brand-600 transition-all active:scale-98"
        >
          <Plus className="h-4 w-4" />
          Add Employee
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-900/10 shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-950/20 text-slate-400 dark:text-slate-500 font-semibold uppercase">
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-900/50 text-slate-700 dark:text-slate-350">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400 dark:text-slate-500">
                    No employees registered yet.
                  </td>
                </tr>
              ) : (
                employees.map(emp => (
                  <tr key={emp._id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/10 transition-colors">
                    <td className="p-4 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold">
                        {emp.name.charAt(0).toUpperCase()}
                      </div>
                      {emp.name}
                    </td>
                    <td className="p-4">{emp.email}</td>
                    <td className="p-4 font-medium flex items-center gap-1.5 mt-1.5">
                      <Shield className="h-3.5 w-3.5 text-violet-500" />
                      {emp.role}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        emp.status === 'active' 
                          ? 'bg-emerald-500/10 text-emerald-500' 
                          : 'bg-red-500/10 text-red-500'
                      }`}>
                        {emp.status === 'active' ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
                        {emp.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(emp)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(emp._id)}
                          className="p-1.5 rounded-lg border border-red-200 dark:border-red-950/20 text-red-500 dark:text-red-400 dark:hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE/EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingEmployee ? 'Edit Employee Details' : 'Register New Employee'}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Set store permissions and credentials
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-3">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 px-3.5 py-2.5 outline-none focus:border-brand-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@business.com"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 px-3.5 py-2.5 outline-none focus:border-brand-500 transition-all"
                  />
                </div>

                {!editingEmployee && (
                  <div>
                    <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Password</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 px-3.5 py-2.5 outline-none focus:border-brand-500 transition-all"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Role Permission</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 px-3.5 py-2.5 outline-none focus:border-brand-500 transition-all"
                    >
                      <option value="Cashier">Cashier</option>
                      <option value="InventoryManager">Inventory Manager</option>
                    </select>
                  </div>

                  {editingEmployee && (
                    <div>
                      <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Account Status</label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 px-3.5 py-2.5 outline-none focus:border-brand-500 transition-all"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-500 text-white font-semibold px-5 py-2.5 hover:bg-brand-600 transition-all"
                >
                  {editingEmployee ? 'Save Changes' : 'Register Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
