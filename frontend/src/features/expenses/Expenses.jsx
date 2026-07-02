import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  Receipt, Plus, Trash2, Calendar, Search, Filter, Loader2, ArrowDownCircle, AlertCircle
} from 'lucide-react';
import api from '../../utils/api';

export default function Expenses() {
  const { searchQuery } = useSelector((state) => state.ui);

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form Fields
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Rent');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('');

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/expenses');
      setExpenses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        amount: parseFloat(amount),
        category,
        description,
        date
      };

      await api.post('/expenses', payload);
      setShowModal(false);
      resetForm();
      loadExpenses();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving expense');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense record?')) {
      try {
        await api.delete(`/expenses/${id}`);
        loadExpenses();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const resetForm = () => {
    setAmount('');
    setCategory('Rent');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  // Calculations
  const totalExpenseVal = expenses.reduce((sum, item) => sum + (item.amount || 0), 0);
  const categoriesList = ['Rent', 'Utilities', 'Salary', 'Inventory', 'Marketing', 'Taxes', 'Miscellaneous'];

  // Filter & Search logic
  const filteredExpenses = expenses.filter(exp => {
    const matchesSearch = exp.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          exp.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter ? exp.category === categoryFilter : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div className="flex items-center justify-between border-b pb-4 dark:border-slate-800">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-850 dark:text-slate-100">Store Expenses</h1>
          <p className="text-xs text-slate-500 mt-0.5">Track and log store rental fees, utilities, employee salaries, and miscellaneous outflows</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-brand-500 text-white font-semibold text-xs px-4 py-2 shadow-lg shadow-brand-500/25 hover:bg-brand-600 transition-all"
        >
          <Plus className="h-4.5 w-4.5" />
          Log New Expense
        </button>
      </div>

      {/* METRICS SUMMARY BAR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-card p-5 shadow-sm flex items-center justify-between border-l-4 border-l-red-500">
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Cash Outflow</span>
            <h3 className="text-base font-extrabold mt-1 text-red-500 tabular-nums whitespace-nowrap">
              Rs. {(totalExpenseVal || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
          <ArrowDownCircle className="h-6 w-6 text-red-500" />
        </div>

        <div className="glass-card p-5 shadow-sm flex items-center justify-between border-l-4 border-l-brand-500">
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Active Categories</span>
            <h3 className="text-base font-extrabold mt-1 text-brand-600 dark:text-brand-400 whitespace-nowrap">
              {new Set(expenses.map(e => e.category)).size} Categories
            </h3>
          </div>
          <Filter className="h-6 w-6 text-brand-500" />
        </div>

        <div className="glass-card p-5 shadow-sm flex items-center justify-between border-l-4 border-l-emerald-500">
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Logged Entries</span>
            <h3 className="text-base font-extrabold mt-1 text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
              {expenses.length} Records
            </h3>
          </div>
          <ArrowDownCircle className="h-6 w-6 text-emerald-500" />
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-xl bg-white dark:bg-slate-900 border dark:border-slate-800 px-3 py-2 text-xs outline-none shadow-sm min-w-40"
        >
          <option value="">All Categories</option>
          {categoriesList.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      {/* EXPENSE LEDGER LIST */}
      <div className="glass-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
            <thead>
              <tr className="border-b bg-slate-50/50 dark:bg-slate-900/50 dark:border-slate-800 text-slate-400 font-semibold">
                <th className="p-4">Log Date</th>
                <th className="p-4">Category</th>
                <th className="p-4">Description</th>
                <th className="p-4">Logged By</th>
                <th className="p-4 text-right">Outflow Amount</th>
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
              ) : filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-400">No expense records found.</td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp._id} className="hover:bg-slate-100/30 dark:hover:bg-slate-900/10">
                    <td className="p-4 font-semibold">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>{new Date(exp.date).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold">
                        {exp.category}
                      </span>
                    </td>
                    <td className="p-4 text-slate-700 dark:text-slate-300 font-medium">{exp.description}</td>
                    <td className="p-4">{exp.userId?.name || 'Store Staff'}</td>
                    <td className="p-4 text-right font-bold text-red-500">
                      Rs. {(exp.amount || 0).toFixed(2)}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleDelete(exp._id)}
                          className="h-6 w-6 rounded-md border border-red-500/20 dark:border-red-950/20 flex items-center justify-center text-red-500 hover:bg-red-500/10 hover:border-red-500/40 transition-all"
                          title="Delete Expense"
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

      {/* LOG EXPENSE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 animate-slide-up">
            
            <div className="flex items-center justify-between border-b pb-2 dark:border-slate-800">
              <span className="font-bold text-sm">Log New Store Expense</span>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="text-slate-400 font-bold hover:text-slate-650">×</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Amount */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-1.5 uppercase">Expense Amount (Rs.)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-xl bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 px-4 py-2.5 text-xs outline-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-1.5 uppercase">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 px-4 py-2.5 text-xs outline-none"
                >
                  {categoriesList.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-1.5 uppercase">Expense Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 px-4 py-2.5 text-xs outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-1.5 uppercase">Description</label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="E.g. Electricity bill payment for June..."
                  rows="3"
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
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
