import React, { useState, useEffect } from 'react';
import { 
  Boxes, Plus, RefreshCw, AlertTriangle, ArrowRightLeft, 
  History, Landmark, Wrench, ChevronRight, User, Loader2
} from 'lucide-react';
import api from '../../utils/api';

export default function Inventory() {
  const [activeTab, setActiveTab] = useState('logs'); // logs, adjust, transfer, stores

  // Lists
  const [logs, setLogs] = useState([]);
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [lowStock, setLowStock] = useState([]);

  // States
  const [loading, setLoading] = useState(true);

  // Forms
  const [selectedProduct, setSelectedProduct] = useState('');
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [adjustStore, setAdjustStore] = useState('');

  const [transferProduct, setTransferProduct] = useState('');
  const [transferQty, setTransferQty] = useState('');
  const [fromStore, setFromStore] = useState('');
  const [toStore, setToStore] = useState('');

  const [storeName, setStoreName] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [storePhone, setStorePhone] = useState('');
  const [storeType, setStoreType] = useState('Store');

  const loadData = async () => {
    setLoading(true);
    try {
      const [logRes, prodRes, storeRes, lowRes] = await Promise.all([
        api.get('/inventory/logs'),
        api.get('/products'),
        api.get('/inventory/stores'),
        api.get('/inventory/low-stock')
      ]);
      setLogs(logRes.data);
      setProducts(prodRes.data);
      setStores(storeRes.data);
      setLowStock(lowRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Submit Stock Adjustment
  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/inventory/adjust', {
        productId: selectedProduct,
        adjustmentQty: parseInt(adjustQty),
        reason: adjustReason,
        storeId: adjustStore || null
      });
      alert('Stock adjusted successfully.');
      setSelectedProduct('');
      setAdjustQty('');
      setAdjustReason('');
      setAdjustStore('');
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Adjustment failed');
    }
  };

  // Submit Stock Transfer
  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    if (fromStore === toStore) {
      alert('Source and destination stores must be different.');
      return;
    }
    try {
      await api.post('/inventory/transfer', {
        productId: transferProduct,
        quantity: parseInt(transferQty),
        fromStoreId: fromStore,
        toStoreId: toStore
      });
      alert('Stock transfer completed successfully.');
      setTransferProduct('');
      setTransferQty('');
      setFromStore('');
      setToStore('');
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Transfer failed');
    }
  };

  // Submit Store / Warehouse Creation
  const handleStoreSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/inventory/stores', {
        name: storeName,
        address: storeAddress,
        phone: storePhone,
        type: storeType
      });
      alert('Store/Warehouse created successfully.');
      setStoreName('');
      setStoreAddress('');
      setStorePhone('');
      setStoreType('Store');
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Store creation failed');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-4 dark:border-slate-800 gap-4">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-850 dark:text-slate-100">Inventory Control</h1>
          <p className="text-xs text-slate-500 mt-0.5">Track stock movements, register adjustments, or manage warehouse transfers</p>
        </div>

        {/* Tab selection */}
        <div className="flex bg-slate-200/50 dark:bg-slate-800/40 p-1 rounded-xl w-fit">
          {['logs', 'adjust', 'transfer', 'stores'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${
                activeTab === tab ? 'bg-white dark:bg-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              {tab === 'logs' ? 'Audit Trail' : tab === 'adjust' ? 'Adjust Stock' : tab === 'transfer' ? 'Transfer stock' : 'Warehouses'}
            </button>
          ))}
        </div>
      </div>

      {/* RENDER LOGS TAB */}
      {activeTab === 'logs' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Logs Table (2 cols) */}
          <div className="lg:col-span-2 glass-card p-6 shadow-sm overflow-hidden flex flex-col justify-between">
            <div className="mb-4">
              <h4 className="text-sm font-semibold">Inventory Audit Logs</h4>
              <p className="text-xs text-slate-500">Chronological history of stock adjustments, sales, and transfers</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
                <thead>
                  <tr className="border-b dark:border-slate-800 text-slate-400 font-semibold">
                    <th className="p-3 pl-4">Date</th>
                    <th className="p-3">Product Details</th>
                    <th className="p-3">Type</th>
                    <th className="p-3 text-right">Change</th>
                    <th className="p-3 text-right whitespace-nowrap">Stock Level</th>
                    <th className="p-3 pr-4">Reason / Staff</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="text-center py-6">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-brand-500" />
                      </td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-6 text-slate-400">No stock transactions recorded.</td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log._id} className="hover:bg-slate-100/50 dark:hover:bg-slate-900/30">
                        <td className="p-3 pl-4 text-[10px] text-slate-400">{new Date(log.createdAt).toLocaleString(undefined, {dateStyle:'short', timeStyle:'short'})}</td>
                        <td className="p-3 max-w-[160px]">
                          <span className="block font-bold text-slate-850 dark:text-slate-200 truncate" title={log.productId?.name || 'Deleted Product'}>
                            {log.productId?.name || 'Deleted Product'}
                          </span>
                          <span className="block text-[9px] text-slate-400 truncate">{log.productId?.sku}</span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            log.type === 'StockIn' || log.type === 'Refund'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : log.type === 'Sale' || log.type === 'StockOut'
                              ? 'bg-red-500/10 text-red-500'
                              : 'bg-indigo-500/10 text-indigo-500'
                          }`}>
                            {log.type}
                          </span>
                        </td>
                        <td className={`p-3 text-right font-bold ${log.quantity > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {log.quantity > 0 ? `+${log.quantity}` : log.quantity}
                        </td>
                        <td className="p-3 text-right text-slate-400 whitespace-nowrap">
                          {log.beforeQuantity} → <span className="font-semibold text-slate-750 dark:text-slate-350">{log.afterQuantity}</span>
                        </td>
                        <td className="p-3 pr-4 max-w-xs truncate">
                          <span className="block font-semibold text-slate-700 dark:text-slate-300">{log.reason || 'No details'}</span>
                          <span className="block text-[9px] text-slate-400">by {log.userId?.name}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Low Stock Alerts (1 col) */}
          <div className="glass-card p-6 shadow-sm">
            <div className="flex items-center gap-2 border-b pb-4 mb-4 dark:border-slate-800">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <div>
                <h4 className="text-sm font-semibold">Low Stock Warnings</h4>
                <p className="text-xs text-slate-500">Products falling below minimum thresholds</p>
              </div>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
              {lowStock.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">All products are adequately stocked.</p>
              ) : (
                lowStock.map((item) => (
                  <div key={item._id} className="flex justify-between items-center p-3 rounded-xl bg-orange-500/5 border border-orange-500/10">
                    <div>
                      <span className="block font-bold text-xs">{item.name}</span>
                      <span className="block text-[10px] text-slate-400">SKU: {item.sku}</span>
                    </div>
                    <div className="text-right">
                      <span className="block font-bold text-xs text-red-500">{item.stock} left</span>
                      <span className="block text-[9px] text-slate-400">alert at: {item.minStockAlert}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ADJUST STOCK TAB */}
      {activeTab === 'adjust' && (
        <div className="glass-card max-w-xl mx-auto p-6 shadow-sm">
          <h4 className="text-sm font-semibold mb-4">Manual Inventory Adjustment</h4>
          <form onSubmit={handleAdjustSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase">Select Catalog Product</label>
              <select
                required
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="w-full rounded-xl bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 px-4 py-2.5 text-xs outline-none"
              >
                <option value="">Choose product...</option>
                {products.map(p => <option key={p._id} value={p._id}>{p.name} (SKU: {p.sku} - Stock: {p.stock})</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase">Adjustment Quantity</label>
                <input
                  type="number"
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  placeholder="E.g. 10 or -5"
                  className="w-full rounded-xl bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 px-4 py-2.5 text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase">Warehouse / Store</label>
                <select
                  value={adjustStore}
                  onChange={(e) => setAdjustStore(e.target.value)}
                  className="w-full rounded-xl bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 px-4 py-2.5 text-xs outline-none"
                >
                  <option value="">Main Branch</option>
                  {stores.map(s => <option key={s._id} value={s._id}>{s.name} ({s.type})</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase">Reason / Remarks</label>
              <input
                type="text"
                required
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                placeholder="E.g. Damaged products writeoff, manual cycle count addition"
                className="w-full rounded-xl bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 px-4 py-2.5 text-xs outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-brand-500 text-white font-semibold text-xs py-2.5 hover:bg-brand-600 shadow-md"
            >
              Post Adjustment
            </button>
          </form>
        </div>
      )}

      {/* TRANSFER TAB */}
      {activeTab === 'transfer' && (
        <div className="glass-card max-w-xl mx-auto p-6 shadow-sm">
          <h4 className="text-sm font-semibold mb-4">Stock Transfer between Branches</h4>
          <form onSubmit={handleTransferSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase">Product to Transfer</label>
              <select
                required
                value={transferProduct}
                onChange={(e) => setTransferProduct(e.target.value)}
                className="w-full rounded-xl bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 px-4 py-2.5 text-xs outline-none"
              >
                <option value="">Choose product...</option>
                {products.map(p => <option key={p._id} value={p._id}>{p.name} (SKU: {p.sku} - Stock: {p.stock})</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase">From Branch</label>
                <select
                  required
                  value={fromStore}
                  onChange={(e) => setFromStore(e.target.value)}
                  className="w-full rounded-xl bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 px-4 py-2.5 text-xs outline-none"
                >
                  <option value="">Select source...</option>
                  {stores.map(s => <option key={s._id} value={s._id}>{s.name} ({s.type})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase">To Warehouse / Store</label>
                <select
                  required
                  value={toStore}
                  onChange={(e) => setToStore(e.target.value)}
                  className="w-full rounded-xl bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 px-4 py-2.5 text-xs outline-none"
                >
                  <option value="">Select destination...</option>
                  {stores.map(s => <option key={s._id} value={s._id}>{s.name} ({s.type})</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase">Transfer Quantity</label>
              <input
                type="number"
                required
                min="1"
                value={transferQty}
                onChange={(e) => setTransferQty(e.target.value)}
                placeholder="E.g. 15"
                className="w-full rounded-xl bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 px-4 py-2.5 text-xs outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-brand-500 text-white font-semibold text-xs py-2.5 hover:bg-brand-600 shadow-md"
            >
              Post Stock Transfer
            </button>
          </form>
        </div>
      )}

      {/* WAREHOUSES STORES TAB */}
      {activeTab === 'stores' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Create Branch form */}
          <div className="glass-card p-6 h-fit shadow-sm">
            <h4 className="text-sm font-semibold mb-4">Register Store or Warehouse</h4>
            <form onSubmit={handleStoreSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase">Name</label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="Acme Warehouse B"
                  className="w-full rounded-xl bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 px-4 py-2.5 text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase">Phone</label>
                  <input
                    type="text"
                    value={storePhone}
                    onChange={(e) => setStorePhone(e.target.value)}
                    placeholder="+1 555-0199"
                    className="w-full rounded-xl bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 px-4 py-2.5 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase">Type</label>
                  <select
                    value={storeType}
                    onChange={(e) => setStoreType(e.target.value)}
                    className="w-full rounded-xl bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 px-4 py-2.5 text-xs outline-none"
                  >
                    <option value="Store">Retail Branch</option>
                    <option value="Warehouse">Warehouse Depot</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase">Street Address</label>
                <input
                  type="text"
                  value={storeAddress}
                  onChange={(e) => setStoreAddress(e.target.value)}
                  placeholder="123 Industrial Way"
                  className="w-full rounded-xl bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 px-4 py-2.5 text-xs outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-brand-500 text-white font-semibold text-xs py-2.5 hover:bg-brand-600 shadow-md"
              >
                Create Store
              </button>
            </form>
          </div>

          {/* List stores */}
          <div className="glass-card p-6 md:col-span-2 shadow-sm">
            <h4 className="text-sm font-semibold mb-4">Active Branches & Warehouses</h4>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
              {stores.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No branch locations registered yet.</p>
              ) : (
                stores.map(store => (
                  <div key={store._id} className="p-4 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
                    <div className="space-y-1">
                      <span className="block font-bold text-slate-800 dark:text-slate-200">{store.name}</span>
                      <span className="block text-[10px] text-slate-400">{store.address || 'No address'} • {store.phone || 'No phone'}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${
                      store.type === 'Warehouse' 
                        ? 'bg-blue-500/10 text-blue-500' 
                        : 'bg-emerald-500/10 text-emerald-500'
                    }`}>
                      {store.type}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
