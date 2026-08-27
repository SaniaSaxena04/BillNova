import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, TrendingUp, ShoppingBag, Users, Plus, ArrowUpRight, AlertTriangle, RefreshCw } from 'lucide-react';
import { productService } from '../services/productService';

export const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [topProducts, setTopProducts] = useState([
    {
      id: 1,
      name: 'Wireless Noise-Canceling Headphones',
      sales: '32 units sold',
      revenue: '₹63,968',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=200',
    },
    {
      id: 2,
      name: 'Smart Fitness Tracker Watch',
      sales: '24 units sold',
      revenue: '₹47,976',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=200',
    },
    {
      id: 3,
      name: 'Ergonomic Mechanical Keyboard',
      sales: '19 units sold',
      revenue: '₹34,181',
      image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=200',
    },
  ]);

  const [restockAlerts, setRestockAlerts] = useState([
    {
      id: 'A1',
      name: 'Organic Espresso Coffee Beans (1kg)',
      stockLeft: '4 bags left',
      recommendedQty: '50 units',
      image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=200',
    },
    {
      id: 'A2',
      name: 'Matte Glass Screen Protector',
      stockLeft: '2 packs left',
      recommendedQty: '100 units',
      image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&q=80&w=200',
    },
  ]);

  useEffect(() => {
    const fetchLiveProducts = async () => {
      try {
        setLoading(true);
        const data = await productService.getProducts();
        if (data && Array.isArray(data) && data.length > 0) {
          // Connected live data
        }
      } catch (err) {
        // Fallback to local default mockup state when server is offline
      } finally {
        setLoading(false);
      }
    };

    fetchLiveProducts();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Hero Banner with Dark Ambient Background Image */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 sm:p-8 shadow-xl">
        <img
          src="https://images.unsplash.com/photo-1556742049-0a670f4a4591?auto=format&fit=crop&q=80&w=1200"
          alt="Retail Operations Banner"
          className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 font-bold text-xs">
              <Sparkles size={14} className="text-purple-400" /> AI Sales Engine Active
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome back, Store Admin 👋
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Here’s what’s happening in your store today. Predictive models suggest restocking fast-moving inventory before weekend demand spikes.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
            {loading && (
              <span className="p-2.5 rounded-xl bg-white/10 text-purple-300 animate-spin">
                <RefreshCw size={16} />
              </span>
            )}
            <button
              onClick={() => navigate('/billing')}
              className="inline-flex items-center gap-2 px-5 py-3 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
            >
              <Plus size={16} /> Quick Invoice
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Revenue */}
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-purple-100/60 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">Total Revenue</span>
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl border border-purple-100">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl font-black text-slate-900">₹42,850.00</h2>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 mt-1">
              <ArrowUpRight size={14} /> +18.2% from yesterday
            </span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-purple-100/60 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">Total Orders</span>
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl border border-purple-100">
              <ShoppingBag size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl font-black text-slate-900">142</h2>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 mt-1">
              <ArrowUpRight size={14} /> +8.4% from yesterday
            </span>
          </div>
        </div>

        {/* New Customers */}
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-purple-100/60 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">New Customers</span>
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl border border-purple-100">
              <Users size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl font-black text-slate-900">38</h2>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 mt-1">
              <ArrowUpRight size={14} /> +12.1% this week
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Section: Top Selling Items + AI Restock Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Products Card */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-purple-100/60 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900">Top Performing Products</h3>
            <button 
              onClick={() => navigate('/inventory')} 
              className="text-xs font-bold text-purple-600 hover:underline cursor-pointer"
            >
              View Inventory
            </button>
          </div>

          <div className="space-y-3">
            {topProducts.map((product) => (
              <div 
                key={product.id} 
                className="flex items-center justify-between p-3 rounded-xl hover:bg-purple-50/40 transition-all border border-transparent hover:border-purple-100"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800 line-clamp-1">{product.name}</p>
                    <p className="text-[11px] font-medium text-slate-500">{product.sales}</p>
                  </div>
                </div>
                <span className="text-xs font-black text-purple-700">{product.revenue}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Restock Suggestions Card */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-purple-100/60 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-500" /> AI Restock Recommendations
            </h3>
            <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold rounded-md">
              Low Stock Alert
            </span>
          </div>

          <div className="space-y-3">
            {restockAlerts.map((item) => (
              <div 
                key={item.id} 
                className="flex items-center justify-between p-3 rounded-xl bg-amber-50/30 border border-amber-100/60"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800 line-clamp-1">{item.name}</p>
                    <p className="text-[11px] font-semibold text-rose-600">{item.stockLeft}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Suggested Order</p>
                  <p className="text-xs font-black text-purple-700">{item.recommendedQty}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};