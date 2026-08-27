import React, { useState } from 'react';
import { 
  Search, FileText, Download, Printer, Filter, CheckCircle, 
  Clock, RotateCcw, Eye, X, User, Calendar, CreditCard, ArrowUpRight 
} from 'lucide-react';

// Sample Invoice Data
const INITIAL_INVOICES = [
  {
    id: 'INV-2026-001',
    customerName: 'Rahul Sharma',
    customerPhone: '+91 98765 43210',
    date: '10 Aug 2026, 02:45 PM',
    amount: 4798.00,
    paymentMethod: 'UPI / GPay',
    status: 'Paid',
    items: [
      { name: 'Wireless Ergonomic Mouse', qty: 1, price: 1299 },
      { name: 'Mechanical RGB Keyboard', qty: 1, price: 3499 }
    ]
  },
  {
    id: 'INV-2026-002',
    customerName: 'Priya Patel',
    customerPhone: '+91 98123 56789',
    date: '10 Aug 2026, 11:15 AM',
    amount: 1850.00,
    paymentMethod: 'Credit Card',
    status: 'Paid',
    items: [
      { name: 'USB-C Fast Charging Hub', qty: 1, price: 1850 }
    ]
  },
  {
    id: 'INV-2026-003',
    customerName: 'Aman Verma',
    customerPhone: '+91 97110 22334',
    date: '09 Aug 2026, 05:30 PM',
    amount: 8999.00,
    paymentMethod: 'Cash',
    status: 'Pending',
    items: [
      { name: 'Noise-Cancelling Headphones', qty: 1, price: 8999 }
    ]
  },
  {
    id: 'INV-2026-004',
    customerName: 'Neha Gupta',
    customerPhone: '+91 99887 66554',
    date: '08 Aug 2026, 04:10 PM',
    amount: 900.00,
    paymentMethod: 'UPI / PhonePe',
    status: 'Refunded',
    items: [
      { name: 'Premium Leather Notebook (A5)', qty: 2, price: 450 }
    ]
  },
  {
    id: 'INV-2026-005',
    customerName: 'Vikram Singh',
    customerPhone: '+91 95432 10987',
    date: '08 Aug 2026, 01:20 PM',
    amount: 1598.00,
    paymentMethod: 'Debit Card',
    status: 'Paid',
    items: [
      { name: 'Stainless Steel Water Bottle (1L)', qty: 2, price: 799 }
    ]
  }
];

const STATUS_FILTERS = ['All', 'Paid', 'Pending', 'Refunded'];

export const Invoices = () => {
  const [invoices] = useState(INITIAL_INVOICES);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Search & Filter Logic
  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          inv.customerPhone.includes(searchTerm);
    const matchesStatus = selectedStatus === 'All' || inv.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // Print Receipt Action
  const handlePrintReceipt = (inv) => {
    const printWindow = window.open('', '_blank', 'width=600,height=700');
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${inv.id}</title>
          <style>
            body { font-family: monospace; padding: 20px; line-height: 1.4; color: #111; }
            .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
            .row { display: flex; justify-content: space-between; margin: 4px 0; }
            .totals { border-top: 1px dashed #000; margin-top: 10px; padding-top: 10px; }
            .bold { font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>BILLNOVA POS</h2>
            <p>Invoice #: ${inv.id}</p>
            <p>Date: ${inv.date}</p>
            <p>Customer: ${inv.customerName} (${inv.customerPhone})</p>
          </div>
          <div>
            ${inv.items.map(item => `
              <div class="row">
                <span>${item.qty}x ${item.name}</span>
                <span>₹${(item.qty * item.price).toLocaleString('en-IN')}</span>
              </div>
            `).join('')}
          </div>
          <div class="totals">
            <div class="row bold">
              <span>TOTAL AMOUNT:</span>
              <span>₹${inv.amount.toLocaleString('en-IN')}</span>
            </div>
            <div class="row">
              <span>Payment Mode:</span>
              <span>${inv.paymentMethod}</span>
            </div>
            <div class="row">
              <span>Status:</span>
              <span>${inv.status}</span>
            </div>
          </div>
          <p style="text-align: center; margin-top: 20px;">--- Thank You For Shopping! ---</p>
          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Invoice & Sales History</h1>
          <p className="text-xs text-slate-500 mt-1">Search transactions by customer, print receipts, and monitor payment statuses.</p>
        </div>
      </div>

      {/* Filter and Customer Search Bar */}
      <div className="glass-card p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Lookup Customer Name, Phone, or Invoice ID..."
            className="w-full pl-9 pr-4 py-2 bg-white/80 border border-purple-200/60 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
          />
        </div>

        {/* Status Pill Filters */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <Filter size={14} className="text-purple-600 shrink-0 mr-1" />
          {STATUS_FILTERS.map(status => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer border ${
                selectedStatus === status 
                  ? 'bg-purple-600 text-white border-purple-600 shadow-sm' 
                  : 'bg-white/60 text-slate-600 border-purple-100 hover:bg-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Invoice Data Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-white/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-purple-100 text-purple-900/60 uppercase font-bold text-[10px] bg-purple-50/40">
                <th className="py-3.5 px-4">Invoice ID</th>
                <th className="py-3.5 px-4">Customer Details</th>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Payment Method</th>
                <th className="py-3.5 px-4 text-right">Total Amount</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-100/50">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    No matching invoices or customer records found.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-white/40 transition-colors">
                    <td className="py-3.5 px-4 font-extrabold text-purple-900">
                      {inv.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{inv.customerName}</div>
                      <div className="text-[10px] text-slate-500">{inv.customerPhone}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {inv.date}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {inv.paymentMethod}
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-slate-900">
                      ₹{inv.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {inv.status === 'Paid' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle size={11} /> Paid
                        </span>
                      )}
                      {inv.status === 'Pending' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          <Clock size={11} /> Pending
                        </span>
                      )}
                      {inv.status === 'Refunded' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          <RotateCcw size={11} /> Refunded
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setSelectedInvoice(inv)}
                          className="p-1.5 text-slate-600 hover:text-purple-700 hover:bg-white/80 rounded-lg transition-colors cursor-pointer"
                          title="View Invoice Details"
                        >
                          <Eye size={15} />
                        </button>
                        <button 
                          onClick={() => handlePrintReceipt(inv)}
                          className="p-1.5 text-purple-700 hover:text-purple-900 hover:bg-purple-100/80 rounded-lg transition-colors cursor-pointer"
                          title="Print Receipt"
                        >
                          <Printer size={15} />
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

      {/* Invoice Detail Modal Drawer */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm">
          <div className="glass-card w-full max-w-lg p-6 rounded-2xl shadow-2xl relative bg-white/95 border border-white space-y-4">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-purple-100">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700">Receipt Details</span>
                <h3 className="text-lg font-extrabold text-slate-900">{selectedInvoice.id}</h3>
              </div>
              <button 
                onClick={() => setSelectedInvoice(null)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Customer & Transaction Meta */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-purple-50/50 rounded-xl border border-purple-100 text-xs">
              <div className="space-y-1">
                <p className="text-slate-500 font-medium flex items-center gap-1"><User size={12} /> Customer</p>
                <p className="font-bold text-slate-900">{selectedInvoice.customerName}</p>
                <p className="text-[11px] text-slate-600">{selectedInvoice.customerPhone}</p>
              </div>
              <div className="space-y-1">
                <p className="text-slate-500 font-medium flex items-center gap-1"><CreditCard size={12} /> Payment Info</p>
                <p className="font-bold text-slate-900">{selectedInvoice.paymentMethod}</p>
                <p className="text-[11px] text-slate-600">{selectedInvoice.date}</p>
              </div>
            </div>

            {/* Itemized Breakdown */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 mb-2">Purchased Items</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {selectedInvoice.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-white/60 rounded-xl border border-purple-100 text-xs">
                    <div>
                      <p className="font-bold text-slate-800">{item.name}</p>
                      <p className="text-[10px] text-slate-500">₹{item.price} x {item.qty}</p>
                    </div>
                    <span className="font-extrabold text-slate-900">
                      ₹{(item.price * item.qty).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Footer */}
            <div className="pt-3 border-t border-purple-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Grand Total</p>
                <p className="text-xl font-black text-purple-900">
                  ₹{selectedInvoice.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => handlePrintReceipt(selectedInvoice)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Printer size={14} /> Print Receipt
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};