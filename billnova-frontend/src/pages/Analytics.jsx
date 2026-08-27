import React, { useState } from 'react';
import { 
  TrendingUp, AlertTriangle, Sparkles, ShoppingBag, ArrowUpRight, ArrowDownRight, 
  Calendar, RefreshCw, Zap, CheckCircle2, ChevronRight 
} from 'lucide-react';

// Sample Revenue Trend Data (Monthly/Weekly)
const REVENUE_DATA = [
  { label: 'Mon', revenue: 32400, forecast: 31000 },
  { label: 'Tue', revenue: 28900, forecast: 29500 },
  { label: 'Wed', revenue: 42850, forecast: 40000 },
  { label: 'Thu', revenue: 38200, forecast: 37500 },
  { label: 'Fri', revenue: 51600, forecast: 48000 },
  { label: 'Sat', revenue: 64200, forecast: 62000 },
  { label: 'Sun', revenue: 58000, forecast: 55000 },
];

// AI Predictive Insights
const AI_INSIGHTS = [
  {
    id: '1',
    type: 'demand_spike',
    title: 'High Demand Expected: Mechanical Keyboards',
    description: 'Historical trend analysis predicts a 35% surge in gaming accessory sales over the upcoming weekend.',
    action: 'Increase buffer stock by +15 units',
    confidence: 92,
    urgency: 'high'
  },
  {
    id: '2',
    type: 'stockout_warning',
    title: 'Stockout Risk: Noise-Cancelling Headphones',
    description: 'Current stock (2 units) will deplete within 36 hours based on current velocity of 1.4 sales/day.',
    action: 'Reorder from supplier now',
    confidence: 98,
    urgency: 'critical'
  },
  {
    id: '3',
    type: 'pricing_opportunity',
    title: 'Optimal Margin Adjusted: Leather Notebooks',
    description: 'Demand elasticity indicates raising price from ₹450 to ₹499 will not impact conversion rate.',
    action: 'Apply +10% price optimization',
    confidence: 85,
    urgency: 'medium'
  }
];

// Fast/Slow Moving Items
const DEMAND_FORECAST_ITEMS = [
  { name: 'Mechanical RGB Keyboard', category: 'Electronics', currentStock: 4, predictedSales7Days: 12, runoutDays: 2, status: 'Critical' },
  { name: 'Noise-Cancelling Headphones', category: 'Electronics', currentStock: 2, predictedSales7Days: 8, runoutDays: 1, status: 'Critical' },
  { name: 'Wireless Ergonomic Mouse', category: 'Electronics', currentStock: 42, predictedSales7Days: 25, runoutDays: 11, status: 'Healthy' },
  { name: 'USB-C Fast Charging Hub', category: 'Accessories', currentStock: 28, predictedSales7Days: 18, runoutDays: 10, status: 'Healthy' },
  { name: 'Stainless Steel Water Bottle', category: 'Lifestyle', currentStock: 50, predictedSales7Days: 10, runoutDays: 35, status: 'Overstocked' },
];

export const Analytics = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const maxRevenue = Math.max(...REVENUE_DATA.map(d => Math.max(d.revenue, d.forecast)));

  const handleRefreshAI = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-[11px] font-bold mb-2">
            <Sparkles size={13} className="text-purple-600" /> Powered by Predictive AI Engine
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">AI Sales & Predictive Analytics</h1>
          <p className="text-xs text-slate-500 mt-1">Real-time revenue forecast, stock depletion predictions, and automated purchasing triggers.</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Timeframe Selector */}
          <div className="bg-white/60 backdrop-blur-md p-1 rounded-xl border border-purple-100 flex items-center gap-1 text-xs font-semibold">
            {['7d', '30d', '90d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  timeRange === range 
                    ? 'bg-purple-600 text-white shadow-sm' 
                    : 'text-slate-600 hover:bg-white'
                }`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>

          <button 
            onClick={handleRefreshAI}
            className={`p-2.5 bg-white/80 border border-purple-100 rounded-xl text-slate-700 hover:text-purple-700 transition-all cursor-pointer ${
              isRefreshing ? 'animate-spin text-purple-600' : ''
            }`}
            title="Recalculate AI Predictions"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* KPI Cards Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-purple-900/60">Predicted 7-Day Revenue</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">₹3,23,250.00</h3>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-1">
              <ArrowUpRight size={14} /> +14.2% vs. Last Week
            </span>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <TrendingUp size={22} />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-purple-900/60">Imminent Stockouts</p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">2 Products</h3>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 mt-1">
              <AlertTriangle size={14} /> Depleting in &lt; 48 Hours
            </span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <AlertTriangle size={22} />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-purple-900/60">Forecast Accuracy Rate</p>
            <h3 className="text-2xl font-black text-purple-900 mt-1">94.8%</h3>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-1">
              <Zap size={14} /> Based on 1,200+ historical orders
            </span>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Sparkles size={22} />
          </div>
        </div>
      </div>

      {/* Main Chart Section & AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue vs. Forecast Chart Visualizer */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Actual Revenue vs. AI Target</h2>
              <p className="text-xs text-slate-500">Daily breakdown comparing realized billing against predictive curve.</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-purple-600 inline-block"></span> Actual
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-purple-300 inline-block"></span> Forecast
              </div>
            </div>
          </div>

          {/* Bar Chart Representation */}
          <div className="pt-8 pb-2 flex items-end justify-between gap-3 h-64 border-b border-purple-100/60 px-2">
            {REVENUE_DATA.map((item, idx) => {
              const actualHeight = (item.revenue / maxRevenue) * 100;
              const forecastHeight = (item.forecast / maxRevenue) * 100;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="w-full flex items-end justify-center gap-1.5 h-full">
                    {/* Actual Bar */}
                    <div 
                      style={{ height: `${actualHeight}%` }} 
                      className="w-1/2 bg-purple-600 rounded-t-lg transition-all group-hover:bg-purple-700 relative"
                    >
                      <span className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded font-bold whitespace-nowrap transition-opacity pointer-events-none z-10">
                        ₹{item.revenue.toLocaleString()}
                      </span>
                    </div>
                    {/* Forecast Bar */}
                    <div 
                      style={{ height: `${forecastHeight}%` }} 
                      className="w-1/2 bg-purple-200/80 rounded-t-lg transition-all group-hover:bg-purple-300"
                    ></div>
                  </div>
                  <span className="text-xs font-bold text-slate-600">{item.label}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
            <span>Peak Demand Day: <strong>Saturday (₹64,200)</strong></span>
            <span>Avg Daily Run Rate: <strong>₹45,250</strong></span>
          </div>
        </div>

        {/* AI Actionable Insights Feed */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="text-purple-600" size={18} />
              <h2 className="text-base font-extrabold text-slate-900">AI Recommendations</h2>
            </div>
            <p className="text-xs text-slate-500">Automated optimizations detected by machine learning models.</p>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[340px] pr-1">
            {AI_INSIGHTS.map((insight) => (
              <div 
                key={insight.id}
                className={`p-3.5 rounded-xl border backdrop-blur-md space-y-2 ${
                  insight.urgency === 'critical' 
                    ? 'bg-amber-500/10 border-amber-200/80' 
                    : 'bg-white/60 border-purple-100'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-900">{insight.title}</h4>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-purple-100 text-purple-800 shrink-0">
                    {insight.confidence}% Match
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">{insight.description}</p>
                <button className="w-full py-1.5 px-3 bg-white/90 hover:bg-purple-600 hover:text-white border border-purple-200 text-purple-900 font-bold text-[11px] rounded-lg transition-all flex items-center justify-between cursor-pointer">
                  <span>{insight.action}</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Demand & Inventory Runout Predictions Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-white/80">
        <div className="p-5 border-b border-purple-100/60 flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">7-Day Demand & Runout Matrix</h2>
            <p className="text-xs text-slate-500">Predicted velocity vs remaining stock to prevent out-of-stock scenarios.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-purple-100 text-purple-900/60 uppercase font-bold text-[10px] bg-purple-50/40">
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Current Stock</th>
                <th className="py-3 px-4 text-center">7-Day Demand Forecast</th>
                <th className="py-3 px-4 text-center">Est. Days Until Empty</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-100/50">
              {DEMAND_FORECAST_ITEMS.map((item, idx) => (
                <tr key={idx} className="hover:bg-white/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-800">{item.name}</td>
                  <td className="py-3.5 px-4 text-slate-600">{item.category}</td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-900">{item.currentStock} units</td>
                  <td className="py-3.5 px-4 text-center font-bold text-purple-700">+{item.predictedSales7Days} units</td>
                  <td className="py-3.5 px-4 text-center font-bold">
                    <span className={item.runoutDays <= 2 ? 'text-amber-700 font-extrabold' : 'text-slate-700'}>
                      {item.runoutDays} {item.runoutDays === 1 ? 'day' : 'days'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {item.status === 'Critical' && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
                        Critical Reorder
                      </span>
                    )}
                    {item.status === 'Healthy' && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Healthy Stock
                      </span>
                    )}
                    {item.status === 'Overstocked' && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200">
                        Sufficient
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};