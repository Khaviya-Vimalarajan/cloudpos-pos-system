import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setSearchQuery } from '../../store/uiSlice';
import { 
  Truck, Plus, Trash2, Edit2, Search, Mail, Phone, MapPin, X, Loader2
} from 'lucide-react';
import api from '../../utils/api';

export default function Suppliers() {
  const dispatch = useDispatch();
  const { searchQuery } = useSelector((state) => state.ui);

  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form Fields (Sri Lankan Defaults)
  const [name, setName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+94 ');
  const [outstandingPayment, setOutstandingPayment] = useState('0');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Sri Lanka');

  const loadSuppliers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/suppliers');
      setSuppliers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name,
        contactName,
        email,
        phone: phone.trim(),
        outstandingPayment: parseFloat(outstandingPayment) || 0,
        address: {
          street,
          city,
          country
        }
      };

      if (editingId) {
        await api.put(`/suppliers/${editingId}`, payload);
      } else {
        await api.post('/suppliers', payload);
      }

      setShowModal(false);
      resetForm();
      loadSuppliers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving supplier');
    }
  };

  const handleEdit = (supp) => {
    setEditingId(supp._id);
    setName(supp.name);
    setContactName(supp.contactName || '');
    setEmail(supp.email || '');
    setPhone(supp.phone || '+94 ');
    setOutstandingPayment(String(supp.outstandingPayment || 0));
    setStreet(supp.address?.street || '');
    setCity(supp.address?.city || '');
    setCountry(supp.address?.country || 'Sri Lanka');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        await api.delete(`/suppliers/${id}`);
        loadSuppliers();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setContactName('');
    setEmail('');
    setPhone('+94 ');
    setOutstandingPayment('0');
    setStreet('');
    setCity('');
    setCountry('Sri Lanka');
  };

  // Filter suppliers by global layout search query
  const filteredSuppliers = suppliers.filter(supp => 
    supp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supp.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (supp.phone && supp.phone.includes(searchQuery))
  );

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div className="flex items-center justify-between border-b pb-4 dark:border-slate-800">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-850 dark:text-slate-100">Suppliers Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage catalog supply vendors and outstanding invoice payments</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-1.5 rounded-xl bg-brand-500 text-white font-semibold text-xs px-4 py-2 shadow-lg shadow-brand-500/25 hover:bg-brand-600 transition-all"
        >
          <Plus className="h-4.5 w-4.5" />
          Add Supplier
        </button>
      </div>

      {/* SUPPLIER LEDGER LIST */}
      <div className="glass-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
            <thead>
              <tr className="border-b bg-slate-50/50 dark:bg-slate-900/50 dark:border-slate-800 text-slate-400 font-semibold">
                <th className="p-4">Vendor Details</th>
                <th className="p-4">Contact Agent</th>
                <th className="p-4">Phone Number</th>
                <th className="p-4">Warehouse Address</th>
                <th className="p-4 text-right">Outstanding Dues</th>
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
              ) : filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-400">No suppliers found.</td>
                </tr>
              ) : (
                filteredSuppliers.map((supp) => (
                  <tr key={supp._id} className="hover:bg-slate-100/30 dark:hover:bg-slate-900/10">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold">
                          {supp.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="block font-bold text-slate-800 dark:text-slate-200">{supp.name}</span>
                          <span className="block text-[10px] text-slate-400 truncate max-w-xs">{supp.email || 'No email'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-slate-750 dark:text-slate-300">{supp.contactName}</td>
                    <td className="p-4 font-mono">{supp.phone || 'No Phone'}</td>
                    <td className="p-4">
                      {supp.address?.street ? (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          <span>{supp.address.street}, {supp.address.city || ''}</span>
                        </div>
                      ) : (
                        <span className="text-slate-450 italic">Not set</span>
                      )}
                    </td>
                    <td className="p-4 text-right font-bold text-red-500">
                      Rs. {(supp.outstandingPayment || 0).toFixed(2)}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-1.5">
                        <button
                          onClick={() => handleEdit(supp)}
                          className="h-6 w-6 rounded-md border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-brand-500 hover:border-brand-500/30 transition-all"
                          title="Edit Supplier"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleDelete(supp._id)}
                          className="h-6 w-6 rounded-md border border-red-500/20 dark:border-red-950/20 flex items-center justify-center text-red-500 hover:bg-red-500/10 hover:border-red-500/40 transition-all"
                          title="Delete Supplier"
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

      {/* ADD / EDIT SUPPLIER MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 animate-slide-up max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b pb-2 dark:border-slate-800">
              <span className="font-bold text-sm">{editingId ? 'Edit Supplier Details' : 'Add Supply Vendor'}</span>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="text-slate-400 font-bold hover:text-slate-650">×</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Supplier Company Name */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-1.5 uppercase">Company Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Lanka Distributors Pvt Ltd"
                  className="w-full rounded-xl bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 px-4 py-2.5 text-xs outline-none"
                />
              </div>

              {/* Contact Person Name */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-1.5 uppercase">Contact Agent Name</label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="James Perera"
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
                  placeholder="+94 11 234 5678"
                  className="w-full rounded-xl bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 px-4 py-2.5 text-xs outline-none font-mono"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-1.5 uppercase">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="logistics@lankadistributors.lk"
                  className="w-full rounded-xl bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 px-4 py-2.5 text-xs outline-none"
                />
              </div>

              {/* Outstanding Payments dues */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-1.5 uppercase">Outstanding Payments Owed (Rs.)</label>
                <input
                  type="number"
                  step="0.01"
                  value={outstandingPayment}
                  onChange={(e) => setOutstandingPayment(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-xl bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 px-4 py-2.5 text-xs outline-none"
                />
              </div>

              {/* Address details */}
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1.5 uppercase">Street Address</label>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="45 Peradeniya Road"
                    className="w-full rounded-xl bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 px-4 py-2.5 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1.5 uppercase">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Kandy"
                    className="w-full rounded-xl bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 px-4 py-2.5 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1.5 uppercase">Country</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Sri Lanka"
                    className="w-full rounded-xl bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 px-4 py-2.5 text-xs outline-none"
                  />
                </div>
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
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
