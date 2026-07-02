import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setSearchQuery } from '../../store/uiSlice';
import { 
  Users, Plus, Trash2, Edit2, Search, Mail, Phone, Award, CreditCard, X, Loader2
} from 'lucide-react';
import api from '../../utils/api';

export default function Customers() {
  const dispatch = useDispatch();
  const { searchQuery } = useSelector((state) => state.ui);

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form Fields (Sri Lankan Defaults)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+94 ');
  const [creditBalance, setCreditBalance] = useState('0');
  const [notes, setNotes] = useState('');

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/customers');
      setCustomers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name,
        email,
        phone: phone.trim(),
        creditBalance: parseFloat(creditBalance) || 0,
        notes
      };

      if (editingId) {
        await api.put(`/customers/${editingId}`, payload);
      } else {
        await api.post('/customers', payload);
      }

      setShowModal(false);
      resetForm();
      loadCustomers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving customer');
    }
  };

  const handleEdit = (cust) => {
    setEditingId(cust._id);
    setName(cust.name);
    setEmail(cust.email || '');
    setPhone(cust.phone || '+94 ');
    setCreditBalance(String(cust.creditBalance || 0));
    setNotes(cust.notes || '');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await api.delete(`/customers/${id}`);
        loadCustomers();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setEmail('');
    setPhone('+94 ');
    setCreditBalance('0');
    setNotes('');
  };

  // Filter customers by global layout search query
  const filteredCustomers = customers.filter(cust => 
    cust.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (cust.phone && cust.phone.includes(searchQuery)) ||
    (cust.email && cust.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div className="flex items-center justify-between border-b pb-4 dark:border-slate-800">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-850 dark:text-slate-100">Customer Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage store credit, loyalty points, and client contact directories</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-1.5 rounded-xl bg-brand-500 text-white font-semibold text-xs px-4 py-2 shadow-lg shadow-brand-500/25 hover:bg-brand-600 transition-all"
        >
          <Plus className="h-4.5 w-4.5" />
          Add Customer
        </button>
      </div>

      {/* CUSTOMER DIRECTORY LIST */}
      <div className="glass-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
            <thead>
              <tr className="border-b bg-slate-50/50 dark:bg-slate-900/50 dark:border-slate-800 text-slate-400 font-semibold">
                <th className="p-4">Customer Details</th>
                <th className="p-4">Phone Number</th>
                <th className="p-4">Email Address</th>
                <th className="p-4 text-center">Loyalty Points</th>
                <th className="p-4 text-right">Credit Balance</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-brand-500" />
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-400">No customers found.</td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => (
                  <tr key={cust._id} className="hover:bg-slate-100/30 dark:hover:bg-slate-900/10">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold">
                          {cust.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="block font-bold text-slate-800 dark:text-slate-200">{cust.name}</span>
                          {cust.notes && <span className="block text-[10px] text-slate-400 italic truncate max-w-xs">{cust.notes}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono font-semibold">{cust.phone || 'No Phone'}</td>
                    <td className="p-4">{cust.email || <span className="text-slate-400 italic">No Email</span>}</td>
                    <td className="p-4 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-brand-500/15 text-brand-600 dark:text-brand-400 font-bold">
                        {cust.loyaltyPoints || 0} pts
                      </span>
                    </td>
                    <td className="p-4 text-right font-bold text-slate-800 dark:text-slate-200">
                      Rs. {(cust.creditBalance || 0).toFixed(2)}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-1.5">
                        <button
                          onClick={() => handleEdit(cust)}
                          className="h-6 w-6 rounded-md border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-brand-500 hover:border-brand-500/30 transition-all"
                          title="Edit Customer"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleDelete(cust._id)}
                          className="h-6 w-6 rounded-md border border-red-500/20 dark:border-red-950/20 flex items-center justify-center text-red-500 hover:bg-red-500/10 hover:border-red-500/40 transition-all"
                          title="Delete Customer"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT CUSTOMER MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 animate-slide-up">
            
            <div className="flex items-center justify-between border-b pb-2 dark:border-slate-800">
              <span className="font-bold text-sm">{editingId ? 'Edit Customer Profile' : 'Register New Customer'}</span>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="text-slate-400 font-bold hover:text-slate-650">×</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-1.5 uppercase">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Kasun Perera"
                  className="w-full rounded-xl bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 px-4 py-2.5 text-xs outline-none"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-1.5 uppercase">Phone Number</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+94 77 123 4567"
                  className="w-full rounded-xl bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 px-4 py-2.5 text-xs outline-none font-mono"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-1.5 uppercase">Email Address (Optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="kasun@gmail.com"
                  className="w-full rounded-xl bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 px-4 py-2.5 text-xs outline-none"
                />
              </div>

              {/* Store Credit Balance */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-1.5 uppercase">Store Credit Limit / Balance (Rs.)</label>
                <input
                  type="number"
                  step="0.01"
                  value={creditBalance}
                  onChange={(e) => setCreditBalance(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-xl bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 px-4 py-2.5 text-xs outline-none"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-1.5 uppercase">Internal Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Premium loyalty tier member..."
                  rows="2"
                  className="w-full rounded-xl bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 px-4 py-2.5 text-xs outline-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="rounded-xl border hover:bg-slate-100 dark:hover:bg-slate-800 px-4 py-2 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-500 text-white font-semibold text-xs px-5 py-2 hover:bg-brand-600 shadow-md"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
