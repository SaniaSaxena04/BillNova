import React, { useState } from 'react';
import { 
  BarChart3, TrendingUp, DollarSign, Download, Calendar, 
  PieChart, CreditCard, ShoppingBag, ArrowUpRight, ArrowDownRight, FileSpreadsheet, FileText
} from 'lucide-react';

const topSellingItems = [
  { name: 'Basmati Rice 5kg', category: 'Grains & Staples', unitsSold: 142, revenue: 92300, margin: '18%' },
  { name: 'Dairy Milk Silk 150g', category: 'Confectionery', unitsSold: 310, revenue: 54250, margin: '22%' },
  { name: 'Sunflower Oil 2L', category: 'Oils & Ghee', unitsSold: 98, revenue: 33320, margin: '12%' },
  { name: 'Organic Almonds 500g', category: 'Dry Fruits', unitsSold: 65, revenue: 31850, margin: '25%' },
  { name: 'Cold Brew Coffee 250ml', category: 'Beverages', unitsSold: 180, revenue: 21600, margin: '35%' },
];

const categoryData = [
  { name: 'Grains & Staples', value: '₹1,25,800', percentage: '40%', color: 'bg-primary' },
  { name: 'Confectionery', value: '₹78,400', percentage: '25%', color: 'bg-secondary' },
  { name: 'Oils & Ghee', value: '₹47,000', percentage: '15%', color: 'bg-amber-500' },
  { name: 'Dry Fruits & Beverages', value: '₹62,800', percentage: '20%', color: 'bg-emerald-500' },
];

const paymentMethods = [
  { method: 'UPI / QR Code', amount: '₹1,94,400', percentage: '62%', count: '412 sales' },
  { method: 'Cash', amount: '₹87,800', percentage: '28%', count: '185 sales' },
  { method: 'Credit / Debit Card', amount: '₹31,800', percentage: '10%', count: '45 sales' },
];

export const Reports = () => {
  const [timeframe, setTimeframe] = useState('month'); // 'today', 'week', 'month', 'year'

  // Mock export handler
  const handleExport = (type) => {
    alert(`Exporting ${timeframe.toUpperCase()} report as ${type.toUpperCase()}...`);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      {/* Top Header & Timeframe Selector */}
      <div className="glass-card p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-white/90 via-white/80 to-primary/10">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold text-xs mb-3">
            <BarChart3 size={14} /> Executive Analytics
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-darkText tracking-tight">
            Reports & Business Insights
          </h1>
          <p className="text-mutedText text-sm mt-1">
            Track revenue trends, product profit margins, and export financial summaries.
          </p>
        </div>

        {/* Timeframe & Export Action Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="glass-card p-1 flex items-center gap-1">
            {['today', 'week', 'month', 'year'].map((period) => (
              <button
                key={period}
                onClick={() => setTimeframe(period)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${
                  timeframe === period 
                    ? 'bg-primary text-white shadow-md shadow-primary/20' 
                    : 'text-mutedText hover:text-darkText'
                }`}
              >
                {period}
              </button>
            ))}
          </div>

          <button 
            onClick={() => handleExport('csv')}
            className="px-4 py-2 glass-card hover:bg-white/80 text-darkText font-semibold text-xs rounded-xl flex items-center gap-2 transition-all"
          >
            <FileSpreadsheet size={16} className="text-emerald-600" /> Export CSV
          </button>
        </div>
      </div>

      {/* Primary Analytics KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-5">
          <div className="flex justify-between items-center">
            <p className="text-xs font-semibold text-mutedText uppercase">Total Revenue</p>
            <div className="p-2 rounded-xl bg-primary/10 text-primary"><DollarSign size={18} /></div>
          </div>
          <p className="text-2xl font-extrabold text-darkText mt-2">₹3,14,000</p>
          <span className="text-xs text-success font-semibold inline-flex items-center gap-1 mt-1">
            <ArrowUpRight size={14} /> +14.2% vs last {timeframe}
          </span>
        </div>

        <div className="glass-card p-5">
          <div className="flex justify-between items-center">
            <p className="text-xs font-semibold text-mutedText uppercase">Estimated Net Profit</p>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600"><TrendingUp size={18} /></div>
          </div>
          <p className="text-2xl font-extrabold text-darkText mt-2">₹69,080</p>
          <span className="text-xs text-emerald-600 font-semibold inline-flex items-center gap-1 mt-1">
            Avg. 22% Net Margin
          </span>
        </div>

        <div className="glass-card p-5">
          <div className="flex justify-between items-center">
            <p className="text-xs font-semibold text-mutedText uppercase">Total Orders</p>
            <div className="p-2 rounded-xl bg-secondary/10 text-secondary"><ShoppingBag size={18} /></div>
          </div>
          <p className="text-2xl font-extrabold text-darkText mt-2">642 Bills</p>
          <span className="text-xs text-success font-semibold inline-flex items-center gap-1 mt-1">
            <ArrowUpRight size={14} /> +8.5% order volume
          </span>
        </div>

        <div className="glass-card p-5">
          <div className="flex justify-between items-center">
            <p className="text-xs font-semibold text-mutedText uppercase">Avg. Order Value (AOV)</p>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600"><CreditCard size={18} /></div>
          </div>
          <p className="text-2xl font-extrabold text-darkText mt-2">₹489</p>
          <span className="text-xs text-mutedText font-medium inline-flex items-center gap-1 mt-1">
            Per customer transaction
          </span>
        </div>
      </div>

      {/* Revenue Breakdown Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Share */}
        <div className="glass-card p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-extrabold text-darkText text-base flex items-center gap-2">
              <PieChart size={18} className="text-primary" /> Sales by Category
            </h3>
            <span className="text-xs font-bold text-mutedText">Revenue Share</span>
          </div>

          <div className="space-y-4">
            {categoryData.map((cat) => (
              <div key={cat.name} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-darkText">
                  <span>{cat.name}</span>
                  <span>{cat.value} ({cat.percentage})</span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${cat.color} rounded-full`} style={{ width: cat.percentage }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods Breakdown */}
        <div className="glass-card p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-extrabold text-darkText text-base flex items-center gap-2">
              <CreditCard size={18} className="text-secondary" /> Payment Collection Modes
            </h3>
            <span className="text-xs font-bold text-mutedText">Breakdown</span>
          </div>

          <div className="space-y-4">
            {paymentMethods.map((pay) => (
              <div key={pay.method} className="p-4 rounded-xl bg-white/60 border border-gray-100/80 flex justify-between items-center">
                <div>
                  <p className="font-bold text-sm text-darkText">{pay.method}</p>
                  <p className="text-xs text-mutedText mt-0.5">{pay.count}</p>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-sm text-darkText">{pay.amount}</p>
                  <span className="text-xs font-bold text-primary">{pay.percentage} of total</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performing SKUs Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-gray-100/60 flex justify-between items-center">
          <div>
            <h3 className="font-extrabold text-darkText text-base">Top Performing Products</h3>
            <p className="text-xs text-mutedText mt-0.5">Highest revenue and profit contributing items</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/60 border-b border-gray-200/60 text-xs uppercase text-mutedText font-semibold">
              <tr>
                <th className="py-4 px-6">Product Name</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Units Sold</th>
                <th className="py-4 px-6">Total Sales</th>
                <th className="py-4 px-6 text-right">Profit Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {topSellingItems.map((item) => (
                <tr key={item.name} className="hover:bg-white/50 transition-colors">
                  <td className="py-4 px-6 font-bold text-darkText">{item.name}</td>
                  <td className="py-4 px-6 text-xs text-mutedText font-medium">{item.category}</td>
                  <td className="py-4 px-6 font-semibold text-darkText">{item.unitsSold} units</td>
                  <td className="py-4 px-6 font-extrabold text-darkText">₹{item.revenue.toLocaleString()}</td>
                  <td className="py-4 px-6 text-right">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 font-extrabold text-xs">
                      {item.margin}
                    </span>
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