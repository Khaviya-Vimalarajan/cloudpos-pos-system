import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setSearchQuery } from '../../store/uiSlice';
import { 
  addToCart, updateQuantity, removeFromCart, updateItemDiscount,
  setCustomer, clearCustomer, setInvoiceDiscount, clearCart, holdOrder, resumeOrder
} from '../../store/posSlice';
import { 
  Search, Trash2, Plus, Minus, CreditCard, Landmark, Check, 
  HelpCircle, UserPlus, Receipt, Sparkles, FolderArchive, Save, Undo, ShoppingBag
} from 'lucide-react';
import api from '../../utils/api';

export default function POS() {
  const dispatch = useDispatch();
  const { cart, customer, discountAmount, taxRate, heldOrders } = useSelector((state) => state.pos);
  const { searchQuery } = useSelector((state) => state.ui);

  // States
  const [products, setProducts] = useState([]);
  const [posViewMode, setPosViewMode] = useState('products'); // 'products' | 'cart'
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Checkout Modal
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [checkoutResult, setCheckoutResult] = useState(null);

  // Customer Modal
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [customerSearch, setCustomerSearch] = useState('');

  // Held Orders Modal
  const [showHeldModal, setShowHeldModal] = useState(false);

  // Refs
  const searchInputRef = useRef(null);

  // Fetch initial products and categories
  useEffect(() => {
    const loadData = async () => {
      try {
        const prodRes = await api.get('/products');
        const catRes = await api.get('/products/categories');
        setProducts(prodRes.data);
        setCategories(catRes.data);
      } catch (err) {
        console.error('Error loading data', err);
      }
    };
    loadData();
  }, []);

  // Fetch customer list
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const { data } = await api.get('/customers');
        setCustomers(data);
      } catch (err) {
        console.error('Error fetching customers', err);
      }
    };
    loadCustomers();
  }, [showCustomerModal]);

  // Keyboard Shortcuts Hook
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F2') {
        e.preventDefault();
        dispatch(holdOrder());
        alert('Current cart has been held successfully.');
      } else if (e.key === 'F4') {
        e.preventDefault();
        if (cart.length > 0) setShowCheckout(true);
      } else if (e.key === 'F3') {
        e.preventDefault();
        setShowCustomerModal(true);
      } else if (e.key === 'Escape') {
        setShowCheckout(false);
        setShowCustomerModal(false);
        setShowHeldModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, dispatch]);

  // Calculate totals
  const subTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItemDiscount = cart.reduce((sum, item) => sum + item.discount * item.quantity, 0);
  const calculatedTax = subTotal * taxRate;
  const grandTotal = subTotal - totalItemDiscount - discountAmount + calculatedTax;
  const changeDue = amountPaid ? parseFloat(amountPaid) - grandTotal : 0;

  // Filters
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || (product.category && (product.category._id === selectedCategory || product.category === selectedCategory));
    const matchesSearch = 
      (product.name || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
      (product.sku || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
      (product.barcode || '').toLowerCase().includes((searchQuery || '').toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCheckoutSubmit = async () => {
    try {
      const payload = {
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          discount: item.discount,
        })),
        customerId: customer?.id || null,
        discountAmount,
        taxAmount: calculatedTax,
        paymentMethod,
        payments: [
          { method: paymentMethod === 'Split' ? 'Cash' : paymentMethod, amount: grandTotal }
        ]
      };

      const { data } = await api.post('/pos/checkout', payload);
      setCheckoutResult(data);
      // Reload products to update stock level
      const prodRes = await api.get('/products');
      setProducts(prodRes.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Checkout failed. Verify item stocks.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-7.5rem)] md:h-[calc(100vh-8rem)]">
      {/* Mobile View Toggle */}
      <div className="lg:hidden flex bg-slate-100 dark:bg-slate-900 border dark:border-slate-800 p-1 rounded-2xl w-full shadow-sm">
        <button
          onClick={() => setPosViewMode('products')}
          type="button"
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            posViewMode === 'products' 
              ? 'bg-brand-500 text-white shadow-md shadow-brand-500/10' 
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
          }`}
        >
          Products ({filteredProducts.length})
        </button>
        <button
          onClick={() => setPosViewMode('cart')}
          type="button"
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all relative ${
            posViewMode === 'cart' 
              ? 'bg-brand-500 text-white shadow-md shadow-brand-500/10' 
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
          }`}
        >
          Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
          {cart.length > 0 && (
            <span className="absolute top-1.5 right-3.5 h-2 w-2 rounded-full bg-orange-400 animate-pulse" />
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 flex-1 overflow-hidden">
        
        {/* LEFT COL: PRODUCT GRID & SEARCH (8 cols) */}
        <div className={`${posViewMode === 'products' ? 'flex' : 'hidden lg:flex'} lg:col-span-8 flex-col justify-between overflow-hidden space-y-3.5`}>
        
        {/* TOP BAR Filters */}
        <div className="flex gap-3 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search by name, SKU, or scan barcode..."
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              className="w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/40 pl-11 pr-4 text-xs outline-none focus:border-brand-500 transition-all text-slate-800 dark:text-slate-200 h-10"
            />
          </div>
          {/* Held Orders Quick Trigger */}
          <button
            onClick={() => setShowHeldModal(true)}
            className="flex items-center gap-2 rounded-2xl bg-slate-200/50 dark:bg-slate-800/40 hover:bg-slate-200 dark:hover:bg-slate-800 px-4 text-xs font-semibold transition-all h-10 shrink-0"
          >
            <FolderArchive className="h-4.5 w-4.5 text-slate-500" />
            Held Session ({heldOrders.length})
          </button>
        </div>

        {/* CATEGORIES HORIZONTAL TAB */}
        <div className="flex gap-2 overflow-x-auto pt-1.5 pb-1.5 max-w-full mt-3.5 mb-1.5">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1.5 rounded-xl text-[10.5px] font-bold whitespace-nowrap transition-all border ${
              selectedCategory === 'All' 
                ? 'bg-brand-500 text-white border-brand-500' 
                : 'bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800/40 text-slate-650 dark:text-slate-400'
            }`}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setSelectedCategory(cat._id)}
              className={`px-3 py-1.5 rounded-xl text-[10.5px] font-bold whitespace-nowrap transition-all border ${
                selectedCategory === cat._id 
                  ? 'bg-brand-500 text-white border-brand-500' 
                  : 'bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800/40 text-slate-650 dark:text-slate-400'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* PRODUCTS SCROLLABLE GRID */}
        <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 pr-1 content-start mt-4">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400 text-xs">
              No products match this filter.
            </div>
          ) : (
            filteredProducts.map((prod) => (
              <div
                key={prod._id}
                onClick={() => prod.stock > 0 && dispatch(addToCart(prod))}
                className={`glass-card p-2.5 h-48 flex flex-col justify-between cursor-pointer hover:border-brand-500/50 hover:shadow-md transition-all select-none relative ${
                  prod.stock === 0 ? 'opacity-50 pointer-events-none' : ''
                }`}
              >
                {prod.stock <= prod.minStockAlert && prod.stock > 0 && (
                  <span className="absolute top-1.5 right-1.5 px-1 py-0.5 rounded-md bg-orange-500/10 border border-orange-500/20 text-[7px] font-bold text-orange-500 scale-90">
                    Low Stock
                  </span>
                )}
                {prod.stock === 0 && (
                  <span className="absolute top-1.5 right-1.5 px-1 py-0.5 rounded-md bg-red-500/10 border border-red-500/20 text-[7px] font-bold text-red-500 scale-90">
                    Out Stock
                  </span>
                )}
                <div className="space-y-1.5">
                  <div className="h-20 w-full flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-900 overflow-hidden text-slate-400 text-[10px] font-bold font-sans shadow-inner">
                    {prod.image ? (
                      <img src={prod.image} alt={prod.name} className="h-full w-full object-cover" />
                    ) : (
                      prod.name.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h5 className="text-[11px] font-bold text-slate-800 dark:text-slate-200 line-clamp-2 leading-tight">{prod.name}</h5>
                    <span className="text-[8px] text-slate-400 block truncate">{prod.sku}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-1 pt-1.5 border-t dark:border-slate-800">
                  <span className="text-xs font-extrabold text-brand-500 tabular-nums">
                    Rs. {(prod.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-[9px] text-slate-400 font-medium">{prod.stock} left</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT COL: CART terminal (4 cols) */}
      <div className={`${posViewMode === 'cart' ? 'flex' : 'hidden lg:flex'} lg:col-span-4 glass-panel rounded-3xl p-4 lg:p-5 flex-col justify-between overflow-hidden shadow-xl border border-slate-200/60 dark:border-slate-800/40`}>
        
        {/* Cart Header */}
        <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
          <div>
            <h4 className="text-sm font-bold">Shopping Cart</h4>
            <span className="text-[10px] text-slate-400">{cart.reduce((sum, item) => sum + item.quantity, 0)} items added</span>
          </div>
          {customer ? (
            <div className="flex items-center gap-1 bg-brand-500/10 border border-brand-500/20 rounded-xl px-2.5 py-1 text-[10px]">
              <span className="font-semibold text-brand-600 dark:text-brand-400">{customer.name}</span>
              <button onClick={() => dispatch(clearCustomer())} className="text-red-500 ml-1 font-bold">×</button>
            </div>
          ) : (
            <button
              onClick={() => setShowCustomerModal(true)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 px-3 py-1.5 text-[10px] font-semibold transition-all"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Customer (F3)
            </button>
          )}
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center py-20 text-slate-400 text-xs gap-2">
              <ShoppingBag className="h-8 w-8 opacity-40 text-slate-500" />
              Cart is currently empty.
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.productId} className="flex justify-between items-center p-3 rounded-2xl bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200/30 dark:border-slate-800/30">
                <div className="space-y-1 flex-1 pr-2">
                  <h6 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{item.name}</h6>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-brand-500">Rs. {item.price.toFixed(2)}</span>
                    {item.discount > 0 && (
                      <span className="text-[9px] text-red-500">Disc: -Rs. {item.discount}</span>
                    )}
                  </div>
                </div>
                {/* Quantity adjustments */}
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-0.5">
                    <button
                      onClick={() => dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity - 1 }))}
                      className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-xs font-semibold w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity + 1 }))}
                      className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <button
                    onClick={() => dispatch(removeFromCart(item.productId))}
                    className="p-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Calculations Footer */}
        <div className="border-t pt-4 space-y-3 dark:border-slate-800 text-xs">
          <div className="flex justify-between items-center text-slate-500">
            <span>Subtotal</span>
            <span className="tabular-nums">Rs. {(subTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          {totalItemDiscount > 0 && (
            <div className="flex justify-between items-center text-red-500">
              <span>Item Discounts</span>
              <span className="tabular-nums">-Rs. {(totalItemDiscount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          )}
          <div className="flex justify-between items-center text-slate-500">
            <span>Invoice Discount</span>
            <div className="flex items-center gap-1">
              <span className="text-slate-400">Rs.</span>
              <input
                type="number"
                value={discountAmount || ''}
                onChange={(e) => dispatch(setInvoiceDiscount(parseFloat(e.target.value) || 0))}
                placeholder="0.00"
                className="w-16 bg-transparent border-none pr-0 text-right text-xs outline-none font-semibold tabular-nums text-slate-700 dark:text-slate-300 focus:bg-slate-100 dark:focus:bg-slate-900 focus:px-1 focus:rounded transition-all"
              />
            </div>
          </div>
          <div className="flex justify-between items-center text-slate-500">
            <span>Sales Tax (10%)</span>
            <span className="tabular-nums">Rs. {(calculatedTax || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between items-center font-bold text-sm border-t pt-3 dark:border-slate-800">
            <span>Total Payable</span>
            <span className="text-brand-500 tabular-nums">Rs. {(grandTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          {/* Quick Actions (Hold/Checkout) */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => dispatch(holdOrder())}
              disabled={cart.length === 0}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 py-3 text-xs font-semibold transition-all disabled:opacity-50"
            >
              <Save className="h-4 w-4 text-slate-500" />
              Hold Session (F2)
            </button>
            <button
              onClick={() => setShowCheckout(true)}
              disabled={cart.length === 0}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white py-3 text-xs font-semibold shadow-lg shadow-brand-500/25 transition-all disabled:opacity-50"
            >
              <CreditCard className="h-4 w-4" />
              Checkout (F4)
            </button>
          </div>
        </div>
      </div>

      {/* CHECKOUT POPUP MODAL */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-6 animate-slide-up">
            
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <span className="font-bold text-base">Complete Sale Payment</span>
              <button onClick={() => { setShowCheckout(false); setCheckoutResult(null); }} className="text-slate-400 font-bold hover:text-slate-600">×</button>
            </div>

            {/* Check Out Results (Receipt) View if processed */}
            {checkoutResult ? (
              <div className="space-y-4">
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
                  <Check className="h-6 w-6" />
                  <div>
                    <span className="block font-bold text-xs">Payment Processed Successfully!</span>
                    <span className="text-[10px] text-slate-500">Invoice: {checkoutResult.invoiceNumber}</span>
                  </div>
                </div>

                {/* Print Layout */}
                <div id="receipt-print-area" className="border border-dashed p-4 rounded-xl text-xs space-y-3 font-mono bg-slate-50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-200">
                  <div className="text-center font-bold">CloudPOS Checkout Receipt</div>
                  <div className="text-center text-[10px] text-slate-500">-------------------------------------</div>
                  <div>Invoice: {checkoutResult.invoiceNumber}</div>
                  <div>Date: {new Date(checkoutResult.createdAt).toLocaleString()}</div>
                  <div className="text-slate-500">-------------------------------------</div>
                  <div className="space-y-1">
                    {checkoutResult.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>{item.name} x{item.quantity}</span>
                        <span>Rs. {item.total.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="text-slate-500">-------------------------------------</div>
                  <div className="flex justify-between font-bold">
                    <span>Grand Total:</span>
                    <span>Rs. {checkoutResult.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <span>{checkoutResult.paymentMethod}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handlePrint}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 py-2.5 text-xs font-semibold"
                  >
                    <Receipt className="h-4.5 w-4.5" />
                    Print Receipt
                  </button>
                  <button
                    onClick={() => {
                      dispatch(clearCart());
                      setShowCheckout(false);
                      setCheckoutResult(null);
                      setAmountPaid('');
                    }}
                    className="flex-1 rounded-xl bg-brand-500 text-white font-semibold text-xs py-2.5 shadow-lg shadow-brand-500/20"
                  >
                    Done & New Order
                  </button>
                </div>
              </div>
            ) : (
              // Payment method selectors
              <div className="space-y-4">
                <div className="space-y-2">
                  <span className="block text-xs font-semibold text-slate-400">SELECT PAYMENT METHOD</span>
                  <div className="grid grid-cols-4 gap-2">
                    {['Cash', 'Card', 'QR', 'Split'].map((method) => (
                      <button
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        className={`rounded-xl border py-3 text-xs font-semibold transition-all ${
                          paymentMethod === method
                            ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400'
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount Inputs for Cash calculations */}
                {paymentMethod === 'Cash' && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <span className="block text-xs font-semibold text-slate-400">Cash Received</span>
                      <input
                        type="number"
                        value={amountPaid}
                        onChange={(e) => setAmountPaid(e.target.value)}
                        placeholder="Enter cash amount"
                        className="w-full rounded-xl bg-slate-100 dark:bg-slate-950 pl-4 pr-4 py-3 text-sm outline-none focus:border-brand-500"
                      />
                    </div>
                    {amountPaid && (
                      <div className="flex justify-between p-3 rounded-xl bg-slate-100/50 dark:bg-slate-950/50 text-xs">
                        <span>Change Due:</span>
                        <span className="font-bold text-emerald-500">Rs. {changeDue.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-center border-t pt-4 dark:border-slate-800">
                  <div>
                    <span className="block text-[10px] text-slate-500">PAYABLE AMOUNT</span>
                    <span className="text-xl font-extrabold text-brand-500">Rs. {grandTotal.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={handleCheckoutSubmit}
                    className="rounded-xl bg-brand-500 text-white font-semibold text-xs px-6 py-3 shadow-lg shadow-brand-500/25 hover:bg-brand-600"
                  >
                    Confirm Checkout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CUSTOMER SELECTION MODAL */}
      {showCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 animate-slide-up">
            <div className="flex items-center justify-between border-b pb-2 dark:border-slate-800">
              <span className="font-bold text-sm">Attach Customer Profile</span>
              <button onClick={() => setShowCustomerModal(false)} className="text-slate-400 font-bold hover:text-slate-600">×</button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search customers..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="w-full rounded-xl bg-slate-100 dark:bg-slate-950/50 pl-10 pr-4 py-2 text-xs outline-none"
              />
            </div>

            <div className="max-h-56 overflow-y-auto space-y-2">
              {customers
                .filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()) || c.phone.includes(customerSearch))
                .map(cust => (
                  <div
                    key={cust._id}
                    onClick={() => {
                      dispatch(setCustomer({ id: cust._id, name: cust.name, phone: cust.phone }));
                      setShowCustomerModal(false);
                      setCustomerSearch('');
                    }}
                    className="p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex justify-between items-center text-xs transition-colors"
                  >
                    <div>
                      <span className="block font-semibold">{cust.name}</span>
                      <span className="block text-[10px] text-slate-500">{cust.phone || 'No phone'}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold">
                      {cust.loyaltyPoints} points
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* HELD SESSIONS MODAL */}
      {showHeldModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 animate-slide-up">
            <div className="flex items-center justify-between border-b pb-2 dark:border-slate-800">
              <span className="font-bold text-sm">Recall Held POS Sessions</span>
              <button onClick={() => setShowHeldModal(false)} className="text-slate-400 font-bold hover:text-slate-600">×</button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {heldOrders.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No held cart sessions found.</p>
              ) : (
                heldOrders.map((held) => (
                  <div key={held.id} className="p-3 rounded-xl border bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
                    <div>
                      <span className="block font-bold text-brand-500">{held.id}</span>
                      <span className="block text-[10px] text-slate-500">{held.cart.length} items • customer: {held.customer?.name || 'Walk-in'}</span>
                      <span className="block text-[8px] text-slate-400">Held at: {new Date(held.heldAt).toLocaleTimeString()}</span>
                    </div>
                    <button
                      onClick={() => {
                        dispatch(resumeOrder(held.id));
                        setShowHeldModal(false);
                      }}
                      className="flex items-center gap-1 rounded-xl bg-brand-500 text-white font-semibold px-3 py-1.5 hover:bg-brand-600 transition-colors"
                    >
                      <Undo className="h-3.5 w-3.5" />
                      Resume
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  );
}
