import React, { useState, useEffect } from 'react';
import { 
  FileText, Calendar, DollarSign, ArrowUpRight, TrendingUp, 
  FileSpreadsheet, Download, RefreshCw, Loader2, Tag
} from 'lucide-react';
import api from '../../utils/api';

export default function Reports() {
  const [activeTab, setActiveTab] = useState('pl'); // pl (P&L), history, expenses

  // Lists
  const [orders, setOrders] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);

  // States
  const [loading, setLoading] = useState(true);
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [ordersRes, expensesRes, dashboardRes] = await Promise.all([
        api.get(`/pos/orders?invoiceNumber=${invoiceSearch}&paymentMethod=${paymentMethodFilter}`),
        api.get('/expenses'),
        api.get('/reports/dashboard')
      ]);
      setOrders(ordersRes.data);
      setExpenses(expensesRes.data);
      setDashboardData(dashboardRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [invoiceSearch, paymentMethodFilter]);

  // PDF Invoice Download trigger
  const handlePdfDownload = async (orderId, invoiceNo) => {
    try {
      const response = await api.get(`/reports/invoice/${orderId}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice-${invoiceNo}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Error rendering PDF receipt.');
    }
  };

  const metrics = dashboardData?.metrics || {};

  // Compute Cashier Sales
  const cashierSales = orders.reduce((acc, order) => {
    const cashierName = order.cashierId?.name || 'Staff';
    if (!acc[cashierName]) {
      acc[cashierName] = { sales: 0, ordersCount: 0 };
    }
    acc[cashierName].sales += order.totalAmount;
    acc[cashierName].ordersCount += 1;
    return acc;
  }, {});

  // Profit and Loss calculations
  const totalSales = metrics.monthlySales || 0;
  const grossProfit = metrics.monthlyProfit || 0;
  const totalCost = totalSales - grossProfit; // Correct Cost of Goods Sold (COGS)
  const totalExpenseValue = metrics.monthlyExpenses || 0;
  const netIncome = grossProfit - totalExpenseValue;

  // Filter expenses to current month to align with monthly P&L statement
  const startOfMonthDate = new Date();
  startOfMonthDate.setDate(1);
  startOfMonthDate.setHours(0, 0, 0, 0);
  const monthlyExpensesList = expenses.filter(exp => new Date(exp.date) >= startOfMonthDate);

  const formatLKR = (val) => {
    return (val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-4 dark:border-slate-800 gap-4">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-850 dark:text-slate-100">Reports & Statements</h1>
          <p className="text-xs text-slate-500 mt-0.5">Review profit/loss balances, download transaction receipts, and track employee performance</p>
        </div>

        {/* Tab selection */}
        <div className="flex bg-slate-200/50 dark:bg-slate-800/40 p-1 rounded-xl w-fit">
          {['pl', 'history', 'expenses'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${
                activeTab === tab ? 'bg-white dark:bg-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              {tab === 'pl' ? 'Profit & Loss' : tab === 'history' ? 'Invoice History' : 'Expense tracking'}
            </button>
          ))}
        </div>
      </div>

      {/* P&L SHEET TAB */}
      {activeTab === 'pl' && (
        <div className="space-y-6">
          {/* P&L Overview cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="glass-card p-6 shadow-sm flex items-center justify-between border-l-4 border-l-brand-500">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Gross Sales Revenue</span>
                <h3 className="text-lg font-extrabold mt-1 tabular-nums">Rs. {formatLKR(totalSales)}</h3>
              </div>
              <DollarSign className="h-6 w-6 text-brand-500" />
            </div>

            <div className="glass-card p-6 shadow-sm flex items-center justify-between border-l-4 border-l-red-500">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Expenses</span>
                <h3 className="text-lg font-extrabold mt-1 tabular-nums">Rs. {formatLKR(totalExpenseValue)}</h3>
              </div>
              <TrendingUp className="h-6 w-6 text-red-500 rotate-180" />
            </div>

            <div className="glass-card p-6 shadow-sm flex items-center justify-between border-l-4 border-l-emerald-500">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Net Income (Month)</span>
                <h3 className={`text-lg font-extrabold mt-1 tabular-nums ${netIncome >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {netIncome >= 0 ? `Rs. ${formatLKR(netIncome)}` : `-Rs. ${formatLKR(Math.abs(netIncome))}`}
                </h3>
              </div>
              <DollarSign className="h-6 w-6 text-emerald-500" />
            </div>
          </div>

          {/* Simple Income Statement Sheet */}
          <div className="glass-card p-6 shadow-sm">
            <h4 className="text-sm font-semibold mb-4 border-b pb-2 dark:border-slate-800">Monthly Profit & Loss Statement</h4>
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between font-bold">
                <span>1. Operating Revenue</span>
                <span className="tabular-nums">Rs. {formatLKR(totalSales)}</span>
              </div>
              <div className="pl-4 flex justify-between text-slate-500">
                <span>Product Checkout Sales</span>
                <span className="tabular-nums">Rs. {formatLKR(totalSales)}</span>
              </div>

              <div className="flex justify-between font-bold border-t pt-3 dark:border-slate-800">
                <span>2. Cost of Goods Sold (COGS)</span>
                <span className="tabular-nums">-Rs. {formatLKR(totalCost)}</span>
              </div>

              <div className="flex justify-between font-bold text-xs bg-slate-100 dark:bg-slate-900/60 p-2 rounded-xl">
                <span>GROSS OPERATING PROFIT</span>
                <span className="text-brand-500 tabular-nums">Rs. {formatLKR(grossProfit)}</span>
              </div>

              <div className="flex justify-between font-bold border-t pt-3 dark:border-slate-800">
                <span>3. Operating Expenses</span>
                <span className="tabular-nums">-Rs. {formatLKR(totalExpenseValue)}</span>
              </div>
              {monthlyExpensesList.map(exp => (
                <div key={exp._id} className="pl-4 flex justify-between text-slate-500">
                  <span>{exp.category} ({exp.description || 'no details'})</span>
                  <span className="tabular-nums">-Rs. {formatLKR(exp.amount)}</span>
                </div>
              ))}

              <div className="flex justify-between font-bold text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-2.5 rounded-xl border border-emerald-500/20">
                <span>NET STORE INCOME</span>
                <span className="tabular-nums">
                  {netIncome >= 0 ? `Rs. ${formatLKR(netIncome)}` : `-Rs. ${formatLKR(Math.abs(netIncome))}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INVOICE HISTORY TAB */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Search by invoice number..."
              value={invoiceSearch}
              onChange={(e) => setInvoiceSearch(e.target.value)}
              className="flex-1 rounded-xl bg-white dark:bg-slate-900 border px-4 py-2 text-xs outline-none"
            />
            <select
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
              className="rounded-xl bg-white dark:bg-slate-900 border px-3 py-2 text-xs outline-none"
            >
              <option value="">All Payment Methods</option>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="QR">QR Code</option>
              <option value="Split">Split</option>
            </select>
          </div>

          {/* Table */}
          <div className="glass-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
                <thead>
                  <tr className="border-b bg-slate-50/50 dark:bg-slate-900/50 dark:border-slate-800 text-slate-400 font-semibold">
                    <th className="p-4">Invoice</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Cashier</th>
                    <th className="p-4">Payment Method</th>
                    <th className="p-4 text-right">Discount</th>
                    <th className="p-4 text-right">Tax</th>
                    <th className="p-4 text-right">Total Amount</th>
                    <th className="p-4 text-center">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {loading ? (
                    <tr>
                      <td colSpan="9" className="text-center py-6">
                        <Loader2 className="h-5 w-5 animate-spin mx-auto text-brand-500" />
                      </td>
                    </tr>
                  ) : orders.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center py-6 text-slate-400">No matching orders found.</td>
                    </tr>
                  ) : (
                    orders.map((ord) => (
                      <tr key={ord._id} className="hover:bg-slate-100/30 dark:hover:bg-slate-900/10">
                        <td className="p-4 font-bold text-slate-800 dark:text-slate-200">{ord.invoiceNumber}</td>
                        <td className="p-4 text-[10px] text-slate-400">{new Date(ord.createdAt).toLocaleString()}</td>
                        <td className="p-4">{ord.customerId?.name || 'Walk-in Guest'}</td>
                        <td className="p-4">{ord.cashierId?.name || 'Staff'}</td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px]">
                            {ord.paymentMethod}
                          </span>
                        </td>
                        <td className="p-4 text-right text-red-500 tabular-nums whitespace-nowrap">-Rs. {formatLKR(ord.discountAmount)}</td>
                        <td className="p-4 text-right tabular-nums whitespace-nowrap">Rs. {formatLKR(ord.taxAmount)}</td>
                        <td className="p-4 text-right font-bold text-slate-850 dark:text-slate-150 tabular-nums whitespace-nowrap">Rs. {formatLKR(ord.totalAmount)}</td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handlePdfDownload(ord._id, ord.invoiceNumber)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-500 dark:hover:text-brand-400 hover:bg-brand-500/10 transition-colors"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* EXPENSES TAB */}
      {activeTab === 'expenses' && (
        <div className="glass-card p-6 shadow-sm">
          <div className="border-b pb-4 mb-4 dark:border-slate-800">
            <h4 className="text-sm font-semibold">Store Expenses Ledger</h4>
            <p className="text-xs text-slate-500">Complete listing of historical business cash outflows</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
              <thead>
                <tr className="border-b text-slate-400 font-semibold">
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Description</th>
                  <th className="pb-3">Logged by</th>
                  <th className="pb-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-6 text-slate-400">No expenses logged.</td>
                  </tr>
                ) : (
                  expenses.map((exp) => (
                    <tr key={exp._id}>
                      <td className="py-3 text-[10px] text-slate-400">{new Date(exp.date).toLocaleDateString()}</td>
                      <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">{exp.category}</td>
                      <td className="py-3">{exp.description}</td>
                      <td className="py-3">{exp.userId?.name}</td>
                      <td className="py-3 text-right font-bold text-red-500 tabular-nums">-Rs. {formatLKR(exp.amount)}</td>
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
