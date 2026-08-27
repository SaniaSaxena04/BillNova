import React, { useState } from 'react';
import { 
  Plus, Search, AlertTriangle, Edit2, Trash2, X, CheckCircle, Package, Filter, ArrowUpDown 
} from 'lucide-react';

// Sample Inventory Data
const INITIAL_PRODUCTS = [
  { id: '1', sku: 'SKU-1001', name: 'Wireless Ergonomic Mouse', category: 'Electronics', price: 1299, costPrice: 850, stock: 42, minStock: 10 },
  { id: '2', sku: 'SKU-1002', name: 'Mechanical RGB Keyboard', category: 'Electronics', price: 3499, costPrice: 2400, stock: 4, minStock: 8 }, // Low stock
  { id: '3', sku: 'SKU-1003', name: 'USB-C Fast Charging Hub', category: 'Accessories', price: 1850, costPrice: 1100, stock: 28, minStock: 15 },
  { id: '4', sku: 'SKU-1004', name: 'Premium Leather Notebook (A5)', category: 'Stationery', price: 450, costPrice: 200, stock: 80, minStock: 20 },
  { id: '5', sku: 'SKU-1005', name: 'Noise-Cancelling Headphones', category: 'Electronics', price: 8999, costPrice: 6200, stock: 2, minStock: 5 }, // Low stock
  { id: '6', sku: 'SKU-1006', name: 'Stainless Steel Water Bottle (1L)', category: 'Lifestyle', price: 799, costPrice: 400, stock: 50, minStock: 15 },
];

const CATEGORIES = ['All Categories', 'Electronics', 'Accessories', 'Stationery', 'Lifestyle'];

export const Inventory = () => {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    sku: '', name: '', category: 'Electronics', price: '', costPrice: '', stock: '', minStock: ''
  });

  // Calculate Low Stock Warning Count
  const lowStockCount = products.filter(p => p.stock <= p.minStock).length;

  // Filter & Search Logic
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || product.category === selectedCategory;
    const matchesLowStock = !showLowStockOnly || product.stock <= product.minStock;

    return matchesSearch && matchesCategory && matchesLowStock;
  });

  // Modal Handlers
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      name: '',
      category: 'Electronics',
      price: '',
      costPrice: '',
      stock: '',
      minStock: '10'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setFormData({ ...product });
    setIsModalOpen(true);
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    const numericForm = {
      ...formData,
      price: Number(formData.price),
      costPrice: Number(formData.costPrice),
      stock: Number(formData.stock),
      minStock: Number(formData.minStock),
    };

    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...numericForm, id: p.id } : p));
    } else {
      setProducts(prev => [...prev, { ...numericForm, id: Date.now().toString() }]);
    }

    setIsModalOpen(false);
  };

  const handleDeleteProduct = (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Inventory Management</h1>
          <p className="text-xs text-slate-500 mt-1">Track stock levels, configure min thresholds, and update catalog items.</p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus size={16} /> Add New Product
        </button>
      </div>

      {/* Low Stock Banner Alert */}
      {lowStockCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-300/60 backdrop-blur-md flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-800 rounded-xl">
              <AlertTriangle size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-950">
                {lowStockCount} {lowStockCount === 1 ? 'item is' : 'items are'} below minimum threshold!
              </p>
              <p className="text-[11px] text-amber-800/80 mt-0.5">Reorder soon to avoid stockouts on high-demand merchandise.</p>
            </div>
          </div>
          <button 
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
              showLowStockOnly 
                ? 'bg-amber-600 text-white border-amber-600' 
                : 'bg-white/80 text-amber-900 border-amber-200 hover:bg-white'
            }`}
          >
            {showLowStockOnly ? 'Show All Products' : 'Filter Low Stock'}
          </button>
        </div>
      )}

      {/* Search & Category Filter Controls */}
      <div className="glass-card p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Product Name or SKU..."
            className="w-full pl-9 pr-4 py-2 bg-white/80 border border-purple-200/60 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
          />
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <Filter size={14} className="text-purple-600 shrink-0 mr-1" />
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer border ${
                selectedCategory === category 
                  ? 'bg-purple-600 text-white border-purple-600 shadow-sm' 
                  : 'bg-white/60 text-slate-600 border-purple-100 hover:bg-white'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-white/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-purple-100 text-purple-900/60 uppercase font-bold text-[10px] bg-purple-50/40">
                <th className="py-3 px-4">SKU / Item</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Selling Price</th>
                <th className="py-3 px-4 text-right">Cost Price</th>
                <th className="py-3 px-4 text-center">Stock Level</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-100/50">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    No products matched your search or category filter.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const isLowStock = product.stock <= product.minStock;
                  return (
                    <tr key={product.id} className="hover:bg-white/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800">{product.name}</div>
                        <div className="text-[10px] text-purple-700 font-semibold">{product.sku}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 bg-purple-100/80 text-purple-900 font-semibold rounded-lg text-[10px]">
                          {product.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-slate-900">
                        ₹{product.price.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-500">
                        ₹{product.costPrice.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-800">
                        {product.stock} <span className="text-[10px] text-slate-400 font-normal">(min: {product.minStock})</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isLowStock ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <AlertTriangle size={11} /> Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle size={11} /> In Stock
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleOpenEditModal(product)}
                            className="p-1.5 text-slate-600 hover:text-purple-700 hover:bg-white/80 rounded-lg transition-colors cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm">
          <div className="glass-card w-full max-w-lg p-6 rounded-2xl shadow-2xl relative bg-white/90 border border-white">
            <div className="flex items-center justify-between pb-4 border-b border-purple-100">
              <h3 className="text-base font-extrabold text-slate-900">
                {editingProduct ? 'Edit Inventory Item' : 'Add New Inventory Item'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">SKU Code</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="glass-input px-3 py-2 text-xs w-full focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">Category</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="glass-input px-3 py-2 text-xs w-full focus:outline-none"
                  >
                    {CATEGORIES.filter(c => c !== 'All Categories').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">Product Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Wireless Ergonomic Mouse"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="glass-input px-3 py-2 text-xs w-full focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">Selling Price (₹)</label>
                  <input 
                    type="number" 
                    required 
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="glass-input px-3 py-2 text-xs w-full focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">Cost Price (₹)</label>
                  <input 
                    type="number" 
                    required 
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    className="glass-input px-3 py-2 text-xs w-full focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">Current Stock Qty</label>
                  <input 
                    type="number" 
                    required 
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="glass-input px-3 py-2 text-xs w-full focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">Min Stock Alert Level</label>
                  <input 
                    type="number" 
                    required 
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                    className="glass-input px-3 py-2 text-xs w-full focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-purple-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};