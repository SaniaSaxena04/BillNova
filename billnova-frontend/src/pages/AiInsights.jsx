import React, { useState } from 'react';
import { 
  Sparkles, TrendingUp, AlertTriangle, ShieldAlert, Users, 
  Lightbulb, RefreshCw, CheckCircle, ArrowRight, Zap, Filter
} from 'lucide-react';
import { Line, Radar, Doughnut } from 'react-chartjs-2';
import { 
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, 
  LineElement, RadialLinearScale, ArcElement, Title, Tooltip, Legend, Filler 
} from 'chart.js';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, 
  RadialLinearScale, ArcElement, Title, Tooltip, Legend, Filler
);

// --- 1. Sales Forecasting Chart Data ---
const forecastChartData = {
  labels: ['Aug 1', 'Aug 5', 'Aug 10', 'Aug 15 (Today)', 'Aug 20 (Pred)', 'Aug 25 (Pred)', 'Aug 30 (Pred)'],
  datasets: [
    {
      label: 'Actual Revenue (₹)',
      data: [32000, 38000, 42000, 42850, null, null, null],
      borderColor: '#4F46E5',
      backgroundColor: '#4F46E5',
      pointRadius: 5,
      tension: 0.3,
    },
    {
      label: 'AI Forecasted Revenue (₹)',
      data: [null, null, null, 42850, 48500, 53000, 59200],
      borderColor: '#06B6D4',
      borderDash: [6, 6],
      backgroundColor: 'rgba(6, 182, 212, 0.1)',
      fill: true,
      pointRadius: 5,
      tension: 0.3,
    }
  ]
};

// --- 2. RFM Customer Segmentation Radar Chart ---
const customerRadarData = {
  labels: ['Recency', 'Frequency', 'Monetary Value', 'Engagement', 'Loyalty Tier'],
  datasets: [
    {
      label: 'VIP Champions (15%)',
      data: [95, 90, 92, 85, 98],
      backgroundColor: 'rgba(79, 70, 229, 0.2)',
      borderColor: '#4F46E5',
      borderWidth: 2,
    },
    {
      label: 'At-Risk Customers (28%)',
      data: [25, 40, 60, 30, 35],
      backgroundColor: 'rgba(239, 68, 68, 0.2)',
      borderColor: '#EF4444',
      borderWidth: 2,
    }
  ]
};

// --- 3. Customer Distribution Doughnut Chart ---
const segmentDoughnutData = {
  labels: ['VIP Champions', 'Loyal Regulars', 'Potential Loyalists', 'At-Risk Buyers'],
  datasets: [{
    data: [15, 35, 22, 28],
    backgroundColor: ['#4F46E5', '#06B6D4', '#10B981', '#EF4444'],
    borderWidth: 0,
  }]
};

export const AiInsights = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [resolvedFraud, setResolvedFraud] = useState([]);

  const handleRefreshModel = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1200);
  };

  const markFraudResolved = (id) => {
    setResolvedFraud([...resolvedFraud, id]);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      {/* AI Header Banner */}
      <div className="glass-card p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-white/90 via-white/80 to-primary/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center gap-1.5">
              <Sparkles size={14} /> BillNova Intelligence Engine v2.4
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-success/10 text-success text-[11px] font-bold">
              Model Status: Healthy
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-darkText tracking-tight">
            Predictive AI Insights & Security
          </h1>
          <p className="text-mutedText text-sm mt-1">
            Machine Learning algorithms analyzing sales trends, customer behavior radar, inventory velocity, and fraud detection.
          </p>
        </div>

        <button 
          onClick={handleRefreshModel}
          disabled={isRefreshing}
          className="px-5 py-2.5 bg-white border border-gray-200 text-darkText font-semibold rounded-xl shadow-sm hover:border-primary/50 transition-all text-sm flex items-center gap-2"
        >
          <RefreshCw size={16} className={isRefreshing ? 'animate-spin text-primary' : 'text-mutedText'} />
          {isRefreshing ? 'Re-running Models...' : 'Run Analysis'}
        </button>
      </div>

      {/* Top AI Metrics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-mutedText uppercase">30-Day Predicted Revenue</span>
            <div className="p-2 bg-primary/10 text-primary rounded-xl"><TrendingUp size={18} /></div>
          </div>
          <p className="text-2xl font-extrabold text-darkText">₹12,45,000</p>
          <p className="text-xs text-success font-semibold mt-1">↑ +14.2% predicted growth</p>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-mutedText uppercase">Fraud Anomalies Detected</span>
            <div className="p-2 bg-danger/10 text-danger rounded-xl"><ShieldAlert size={18} /></div>
          </div>
          <p className="text-2xl font-extrabold text-danger">2 Alerts</p>
          <p className="text-xs text-mutedText mt-1">Requires store manager review</p>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-mutedText uppercase">Customer Churn Risk</span>
            <div className="p-2 bg-warning/10 text-warning rounded-xl"><Users size={18} /></div>
          </div>
          <p className="text-2xl font-extrabold text-darkText">28%</p>
          <p className="text-xs text-warning font-semibold mt-1">42 customers at risk this month</p>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-mutedText uppercase">Cross-Sell Opportunity</span>
            <div className="p-2 bg-secondary/10 text-secondary rounded-xl"><Zap size={18} /></div>
          </div>
          <p className="text-2xl font-extrabold text-darkText">3 Bundles</p>
          <p className="text-xs text-secondary font-semibold mt-1">Est. +₹18,500 monthly lift</p>
        </div>
      </div>

      {/* Section 1: Sales Forecasting Engine */}
      <div className="glass-card p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
          <div>
            <h3 className="text-lg font-extrabold text-darkText flex items-center gap-2">
              <TrendingUp className="text-primary" size={20} /> Revenue Forecast & Demand Modeling
            </h3>
            <p className="text-xs text-mutedText">Combined Time-Series Forecasting (ARIMA + Scikit-Learn Regression)</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-mutedText">Confidence Level:</span>
            <span className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-bold rounded-lg">94.8% Accurate</span>
          </div>
        </div>

        <div className="h-72">
          <Line 
            data={forecastChartData} 
            options={{ 
              responsive: true, 
              maintainAspectRatio: false,
              plugins: {
                legend: { position: 'top' },
                tooltip: { mode: 'index', intersect: false }
              },
              scales: {
                y: { grid: { color: 'rgba(226, 232, 240, 0.6)' } },
                x: { grid: { display: false } }
              }
            }} 
          />
        </div>
      </div>

      {/* Section 2: Fraud Detection & Anomaly Matrix */}
      <div className="glass-card p-6 md:p-8 border-l-4 border-l-danger">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-extrabold text-darkText flex items-center gap-2">
              <ShieldAlert className="text-danger" size={20} /> Real-Time Fraud & Anomaly Detection
            </h3>
            <p className="text-xs text-mutedText">Isolated unusual cash register transactions, barcode manipulations, and time anomalies</p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-danger/10 text-danger rounded-full">
            2 Active Flags
          </span>
        </div>

        <div className="space-y-4">
          {[
            {
              id: 'f1',
              title: 'Unusually High Manual Price Override',
              time: 'Today, 02:14 PM',
              terminal: 'POS #02 (Cashier: Rohan S.)',
              description: 'Product "Organic Almonds 500g" (MRP ₹490) was manually discounted to ₹49 (90% discount).',
              severity: 'HIGH',
              color: 'bg-danger/10 text-danger border-danger/30',
            },
            {
              id: 'f2',
              title: 'Duplicate Rapid Refund Alert',
              time: 'Today, 11:40 AM',
              terminal: 'POS #01 (Cashier: Priya M.)',
              description: 'Two identical cash refunds of ₹1,250 processed within 45 seconds on Invoice #INV-8842.',
              severity: 'MEDIUM',
              color: 'bg-warning/10 text-warning border-warning/30',
            }
          ].map((item) => {
            const isResolved = resolvedFraud.includes(item.id);
            return (
              <div 
                key={item.id} 
                className={`p-4 rounded-xl border transition-all ${isResolved ? 'opacity-50 bg-gray-100' : 'bg-white/80'}`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${item.color}`}>
                      {item.severity} SEVERITY
                    </span>
                    <h4 className="font-bold text-darkText text-sm">{item.title}</h4>
                  </div>
                  <span className="text-xs text-mutedText">{item.time} • {item.terminal}</span>
                </div>
                <p className="text-xs text-mutedText mb-3">{item.description}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-mutedText">Recommended Action: Verify cash drawer receipt against audit logs</span>
                  {isResolved ? (
                    <span className="text-xs font-bold text-success flex items-center gap-1">
                      <CheckCircle size={14} /> Resolved & Logged
                    </span>
                  ) : (
                    <button 
                      onClick={() => markFraudResolved(item.id)}
                      className="px-3 py-1 bg-darkText text-white hover:bg-primary text-xs font-semibold rounded-lg transition-colors"
                    >
                      Investigate & Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 3: Customer Segmentation & Cross-Sell Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Customer RFM Radar Chart */}
        <div className="lg:col-span-7 glass-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-extrabold text-darkText flex items-center gap-2">
                  <Users className="text-primary" size={20} /> RFM Customer Behavior Radar
                </h3>
                <p className="text-xs text-mutedText">Segmentation by Recency, Frequency, and Monetary parameters</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div className="h-60">
                <Radar data={customerRadarData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
              </div>
              <div className="h-52 flex justify-center items-center">
                <Doughnut data={segmentDoughnutData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/20 text-xs text-mutedText flex items-center justify-between">
            <span><strong>Win-Back Automation Suggestion:</strong> 28% of customers are becoming inactive. Trigger a Telegram/Email 10% discount promo code.</span>
            <button className="px-3 py-1.5 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover text-xs whitespace-nowrap ml-2">
              Send Automated Campaign
            </button>
          </div>
        </div>

        {/* Product Recommendations & Bundling */}
        <div className="lg:col-span-5 glass-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-darkText flex items-center gap-2 mb-1">
              <Lightbulb className="text-warning" size={20} /> Smart Product Bundles
            </h3>
            <p className="text-xs text-mutedText mb-4">Market Basket Analysis (Apriori Affinity Mining)</p>

            <div className="space-y-3">
              {[
                { primary: 'Basmati Rice 5kg', paired: 'Desi Ghee 1L', lift: '+24% Combo Probability', confidence: '88%' },
                { primary: 'Dairy Milk Silk 150g', paired: 'Cold Brew Coffee', lift: '+18% Combo Probability', confidence: '79%' },
                { primary: 'Organic Wheat Flour', paired: 'Sunflower Oil 2L', lift: '+31% Combo Probability', confidence: '92%' },
              ].map((bundle, idx) => (
                <div key={idx} className="p-3 bg-white/70 rounded-xl border border-white flex flex-col justify-between gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-darkText">{bundle.primary}</span>
                    <span className="text-[10px] font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded">
                      {bundle.confidence} Confidence
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-mutedText">
                    <span className="flex items-center gap-1">
                      Pairs with: <strong className="text-darkText">{bundle.paired}</strong>
                    </span>
                    <span className="text-success font-semibold">{bundle.lift}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button className="w-full mt-4 py-2.5 bg-darkText text-white font-bold text-xs rounded-xl hover:bg-primary transition-colors flex items-center justify-center gap-2">
            Push Bundles to Billing POS <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};