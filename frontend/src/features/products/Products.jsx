import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setSearchQuery } from '../../store/uiSlice';
import { 
  Search, Plus, Edit2, Trash2, Download, Upload, 
  Tag, Award, Eye, X, Loader2, AlertCircle, FileSpreadsheet
} from 'lucide-react';
import api from '../../utils/api';

export default function Products() {
  const dispatch = useDispatch();
  const { searchQuery } = useSelector((state) => state.ui);
  const [activeTab, setActiveTab] = useState('products'); // products, categories, brands

  // Lists
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // States
  const [loading, setLoading] = useState(true);
  const [catFilter, setCatFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');

  // Modals
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showCatModal, setShowCatModal] = useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [csvFile, setCsvFile] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');
  const [stock, setStock] = useState('');
  const [minStockAlert, setMinStockAlert] = useState('5');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');

  const [catName, setCatName] = useState('');
  const [brandName, setBrandName] = useState('');

  const handleProductImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Fetch Lists
  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, brandRes] = await Promise.all([
        api.get(`/products?search=${searchQuery}&category=${catFilter}&stockStatus=${stockFilter}`),
        api.get('/products/categories'),
        api.get('/products/brands')
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
      setBrands(brandRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchQuery, catFilter, stockFilter]);

  // Submit Product Form (Create / Update)
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name, sku, barcode, 
        price: parseFloat(price), 
        cost: parseFloat(cost), 
        stock: parseInt(stock), 
        minStockAlert: parseInt(minStockAlert),
        category: category || null,
        brand: brand || null,
        description,
        image
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, payload);
      } else {
        await api.post('/products', payload);
      }

      setShowProductModal(false);
      resetProductForm();
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving product');
    }
  };

  const editProductTrigger = (prod) => {
    setEditingProduct(prod);
    setName(prod.name);
    setSku(prod.sku);
    setBarcode(prod.barcode);
    setPrice(prod.price);
    setCost(prod.cost);
    setStock(prod.stock);
    setMinStockAlert(prod.minStockAlert);
    setCategory(prod.category?._id || '');
    setBrand(prod.brand?._id || '');
    setDescription(prod.description || '');
    setImage(prod.image || '');
    setShowProductModal(true);
  };

  const deleteProductTrigger = async (id) => {
    if (window.confirm('Are you sure you want to delete/archive this product?')) {
      try {
        await api.delete(`/products/${id}`);
        loadData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const resetProductForm = () => {
    setEditingProduct(null);
    setName('');
    setSku('');
    setBarcode('');
    setPrice('');
    setCost('');
    setStock('');
    setMinStockAlert('5');
    setCategory('');
    setBrand('');
    setDescription('');
    setImage('');
  };

  // Submit Category
  const handleCatSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/products/categories', { name: catName });
      setShowCatModal(false);
      setCatName('');
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving category');
    }
  };

  // Submit Brand
  const handleBrandSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/products/brands', { name: brandName });
      setShowBrandModal(false);
      setBrandName('');
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving brand');
    }
  };

  // CSV EXPORT Trigger
  const handleCsvExport = async () => {
    try {
      const response = await api.get('/products/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'products_export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
    }
  };

  // CSV IMPORT Trigger
  const handleCsvImport = async (e) => {
    e.preventDefault();
    if (!csvFile) return;

    const formData = new FormData();
    formData.append('file', csvFile);

    try {
      const { data } = await api.post('/products/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert(data.message);
      setCsvFile(null);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'CSV Import failed.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER WITH TABS */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-4 dark:border-slate-800 gap-4">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-850 dark:text-slate-100">Product Catalogue</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage categories, brands, product stock and variants</p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-200/50 dark:bg-slate-800/40 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'products' ? 'bg-white dark:bg-slate-900 shadow-sm' : 'text-slate-500'
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'categories' ? 'bg-white dark:bg-slate-900 shadow-sm' : 'text-slate-500'
            }`}
          >
            Categories
          </button>
          <button
            onClick={() => setActiveTab('brands')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'brands' ? 'bg-white dark:bg-slate-900 shadow-sm' : 'text-slate-500'
            }`}
          >
            Brands
          </button>
        </div>
      </div>

      {/* PRODUCTS TAB */}
      {activeTab === 'products' && (
        <div className="space-y-5">
          {/* Actions & Filters bar */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                  className="w-full sm:w-60 rounded-xl bg-white dark:bg-slate-900 border pl-10 pr-4 py-2 text-xs outline-none focus:border-brand-500 transition-all text-slate-800 dark:text-slate-200"
                />
              </div>

              {/* Category filter */}
              <select
                value={catFilter}
                onChange={(e) => setCatFilter(e.target.value)}
                className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-[10.5px] font-semibold outline-none"
              >
                <option value="">All Categories</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>

              {/* Stock status filter */}
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-[10.5px] font-semibold outline-none"
              >
                <option value="">All Stock</option>
                <option value="low">Low Stock Alerts</option>
                <option value="out">Out of Stock</option>
              </select>
            </div>

            {/* Catalogue Buttons */}
            <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end">
              <button
                onClick={handleCsvExport}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 px-3 py-1.5 text-[10.5px] font-bold transition-all"
              >
                <Download className="h-3.5 w-3.5 text-slate-500" />
                Export CSV
              </button>
              
              {/* CSV Upload form label */}
              <label className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 px-3 py-1.5 text-[10.5px] font-bold cursor-pointer transition-all">
                <Upload className="h-3.5 w-3.5 text-slate-500" />
                Import CSV
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setCsvFile(file);
                    }
                  }}
                />
              </label>

              {csvFile && (
                <button
                  onClick={handleCsvImport}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 text-[10.5px] font-bold"
                >
                  <Check className="h-3.5 w-3.5" />
                  Confirm Upload
                </button>
              )}

              <button
                onClick={() => { resetProductForm(); setShowProductModal(true); }}
                className="flex items-center gap-1.5 rounded-xl bg-brand-500 text-white font-bold text-[10.5px] px-3.5 py-1.5 shadow-lg shadow-brand-500/25 hover:bg-brand-600 transition-all"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Product
              </button>
            </div>
          </div>

          {/* TABLE DISPLAY */}
          <div className="glass-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
                <thead>
                  <tr className="border-b bg-slate-50/50 dark:bg-slate-900/50 dark:border-slate-800 text-slate-400 font-semibold">
                    <th className="p-4">Product details</th>
                    <th className="p-4">SKU / Barcode</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4 text-right">Price (Cost)</th>
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
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-slate-400">No products found. Add products to populate.</td>
                    </tr>
                  ) : (
                    products.map((prod) => (
                      <tr key={prod._id} className="hover:bg-slate-100/30 dark:hover:bg-slate-900/10">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden font-bold text-slate-500 shadow-inner">
                              {prod.image ? (
                                <img src={prod.image} alt={prod.name} className="h-full w-full object-cover" />
                              ) : (
                                prod.name.slice(0, 2).toUpperCase()
                              )}
                            </div>
                            <div>
                              <span className="block font-bold text-slate-850 dark:text-slate-200">{prod.name}</span>
                              <span className="block text-[10px] text-slate-400">{prod.brand?.name || 'No brand'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-mono">
                          <span className="block text-[10px]">{prod.sku}</span>
                          <span className="block text-[9px] text-slate-400">{prod.barcode}</span>
                        </td>
                        <td className="p-4">
                          {prod.category ? (
                            <span className="px-2 py-0.5 rounded bg-brand-500/15 text-brand-600 dark:text-brand-400 font-medium">
                              {prod.category.name}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">None</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`font-semibold ${
                            prod.stock === 0 
                              ? 'text-red-500' 
                              : prod.stock <= prod.minStockAlert 
                              ? 'text-orange-500' 
                              : 'text-slate-800 dark:text-slate-200'
                          }`}>
                            {prod.stock} units
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <span className="block font-bold text-slate-850 dark:text-slate-200 tabular-nums">
                            Rs. {(prod.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          <span className="block text-[10px] text-slate-450 dark:text-slate-405 tabular-nums">
                            cost: Rs. {(prod.cost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex justify-center gap-1.5">
                            <button
                              onClick={() => editProductTrigger(prod)}
                              className="h-6 w-6 rounded-md border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-brand-500 hover:border-brand-500/30 transition-all"
                              title="Edit Product"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => deleteProductTrigger(prod._id)}
                              className="h-6 w-6 rounded-md border border-red-500/20 dark:border-red-950/20 flex items-center justify-center text-red-500 hover:bg-red-500/10 hover:border-red-500/40 transition-all"
                              title="Delete Product"
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
        </div>
      )}

      {/* CATEGORIES TAB */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 h-fit shadow-sm">
            <h4 className="text-sm font-semibold mb-4">Create New Category</h4>
            <form onSubmit={handleCatSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase">Category Name</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="Beverages, Clothes, electronics..."
                  className="w-full rounded-xl bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 px-4 py-2.5 text-xs outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-brand-500 text-white font-semibold text-xs py-2.5 hover:bg-brand-600 shadow-md"
              >
                Save Category
              </button>
            </form>
          </div>

          <div className="glass-card p-6 md:col-span-2 shadow-sm">
            <h4 className="text-sm font-semibold mb-4">Categories Register</h4>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {categories.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No categories defined yet.</p>
              ) : (
                categories.map(cat => (
                  <div key={cat._id} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border dark:border-slate-800">
                    <span className="text-xs font-bold">{cat.name}</span>
                    <button
                      onClick={async () => {
                        if (window.confirm('Delete category?')) {
                          await api.delete(`/products/categories/${cat._id}`);
                          loadData();
                        }
                      }}
                      className="h-6 w-6 rounded-md border border-red-500/20 dark:border-red-950/20 flex items-center justify-center text-red-500 hover:bg-red-500/10 hover:border-red-500/40 transition-all"
                      title="Delete Category"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* BRANDS TAB */}
      {activeTab === 'brands' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 h-fit shadow-sm">
            <h4 className="text-sm font-semibold mb-4">Create New Brand</h4>
            <form onSubmit={handleBrandSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase">Brand Name</label>
                <input
                  type="text"
                  required
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Coca Cola, Adidas, Nike..."
                  className="w-full rounded-xl bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 px-4 py-2.5 text-xs outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-brand-500 text-white font-semibold text-xs py-2.5 hover:bg-brand-600 shadow-md"
              >
                Save Brand
              </button>
            </form>
          </div>

          <div className="glass-card p-6 md:col-span-2 shadow-sm">
            <h4 className="text-sm font-semibold mb-4">Brands Register</h4>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {brands.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No brands defined yet.</p>
              ) : (
                brands.map(br => (
                  <div key={br._id} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border dark:border-slate-800">
                    <span className="text-xs font-bold">{br.name}</span>
                    <button
                      onClick={async () => {
                        if (window.confirm('Delete brand?')) {
                          await api.delete(`/products/brands/${br._id}`);
                          loadData();
                        }
                      }}
                      className="h-6 w-6 rounded-md border border-red-500/20 dark:border-red-950/20 flex items-center justify-center text-red-500 hover:bg-red-500/10 hover:border-red-500/40 transition-all"
                      title="Delete Brand"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT FORM MODAL */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-3xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto animate-slide-up">
            
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <span className="font-bold text-base">{editingProduct ? 'Edit Catalog Product' : 'Add Catalog Product'}</span>
              <button onClick={() => { setShowProductModal(false); resetProductForm(); }} className="text-slate-400 font-bold hover:text-slate-650">×</button>
            </div>

            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Product Image */}
                <div className="sm:col-span-2 flex flex-col items-center gap-2 pb-3 border-b dark:border-slate-800">
                  <span className="block text-[10px] font-semibold text-slate-400 uppercase self-start">Product Photo</span>
                  <div className="relative group h-24 w-24 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-xs font-semibold text-slate-400 shadow-inner">
                    {image ? (
                      <img src={image} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      'No Image'
                    )}
                    <label htmlFor="product-image-upload" className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px] text-white">
                      <Upload className="h-4 w-4 mb-1" />
                      Upload
                    </label>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProductImageUpload}
                    className="hidden"
                    id="product-image-upload"
                  />
                  {image && (
                    <button
                      type="button"
                      onClick={() => setImage('')}
                      className="text-[10px] text-red-500 font-semibold hover:underline"
                    >
                      Remove Photo
                    </button>
                  )}
                </div>

                {/* Product Name */}
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1.5 uppercase">Product Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Coca Cola Can 330ml"
                    className="w-full rounded-xl bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 px-4 py-2.5 text-xs outline-none"
                  />
                </div>

                {/* SKU */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1.5 uppercase">SKU (Auto-Generated if blank)</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="E.g. PROD-COCA-330"
                    className="w-full rounded-xl bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 px-4 py-2.5 text-xs outline-none"
                  />
                </div>

                {/* Barcode */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1.5 uppercase">Barcode (Auto-Generated if blank)</label>
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="E.g. 5449000000996"
                    className="w-full rounded-xl bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 px-4 py-2.5 text-xs outline-none"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1.5 uppercase">Selling Price (Rs.)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="2.50"
                    className="w-full rounded-xl bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 px-4 py-2.5 text-xs outline-none"
                  />
                </div>

                {/* Cost */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1.5 uppercase">Buying Cost (Rs.)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    placeholder="1.10"
                    className="w-full rounded-xl bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 px-4 py-2.5 text-xs outline-none"
                  />
                </div>

                {/* Initial Stock */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1.5 uppercase">Initial Stock Level</label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="50"
                    className="w-full rounded-xl bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 px-4 py-2.5 text-xs outline-none"
                  />
                </div>

                {/* Min Stock Alert */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1.5 uppercase">Low-Stock Alert Level</label>
                  <input
                    type="number"
                    required
                    value={minStockAlert}
                    onChange={(e) => setMinStockAlert(e.target.value)}
                    placeholder="5"
                    className="w-full rounded-xl bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 px-4 py-2.5 text-xs outline-none"
                  />
                </div>

                {/* Category selection */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1.5 uppercase">Product Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 px-4 py-2.5 text-xs outline-none"
                  >
                    <option value="">No Category</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>

                {/* Brand selection */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1.5 uppercase">Product Brand</label>
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full rounded-xl bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 px-4 py-2.5 text-xs outline-none"
                  >
                    <option value="">No Brand</option>
                    {brands.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                  </select>
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1.5 uppercase">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter short details about the product..."
                    rows="3"
                    className="w-full rounded-xl bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 px-4 py-2.5 text-xs outline-none"
                  />
                </div>

              </div>

              <div className="flex gap-3 justify-end border-t pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => { setShowProductModal(false); resetProductForm(); }}
                  className="rounded-xl border hover:bg-slate-100 dark:hover:bg-slate-800 px-4 py-2.5 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-500 text-white font-semibold text-xs px-5 py-2.5 hover:bg-brand-600 shadow-md"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
