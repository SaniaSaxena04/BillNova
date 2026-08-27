import React, { useState, useRef } from 'react';
import axios from 'axios';
import { 
  Search, Plus, Minus, Trash2, Printer, 
  CreditCard, Banknote, QrCode, ShoppingBag, ArrowRight, RotateCcw, X, ShieldCheck
} from 'lucide-react';

// Mock product inventory database
const INITIAL_PRODUCTS = [
  { id: '1', sku: 'SKU-1001', name: 'Wireless Ergonomic Mouse', category: 'Electronics', price: 1299, taxRate: 18, stock: 42 },
  { id: '2', sku: 'SKU-1002', name: 'Mechanical RGB Keyboard', category: 'Electronics', price: 3499, taxRate: 18, stock: 15 },
  { id: '3', sku: 'SKU-1003', name: 'USB-C Fast Charging Hub (6-in-1)', category: 'Accessories', price: 1850, taxRate: 18, stock: 28 },
  { id: '4', sku: 'SKU-1004', name: 'Premium Leather Notebook (A5)', category: 'Stationery', price: 450, taxRate: 12, stock: 80 },
  { id: '5', sku: 'SKU-1005', name: 'Noise-Cancelling Headphones', category: 'Electronics', price: 8999, taxRate: 18, stock: 9 },
  { id: '6', sku: 'SKU-1006', name: 'Stainless Steel Water Bottle (1L)', category: 'Lifestyle', price: 799, taxRate: 12, stock: 50 },
];

export const Billing = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [invoiceSuccess, setInvoiceSuccess] = useState(false);
  const [lastInvoiceNumber, setLastInvoiceNumber] = useState('');
  const [loading, setLoading] = useState(false);

  // Modal payment states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });

  const invoiceRef = useRef(null);

  // Filter products by search term or SKU
  const filteredProducts = INITIAL_PRODUCTS.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add item to cart or increment quantity if already present
  const addToCart = (product) => {
    setCart(prevCart => {
      const existing = prevCart.find(item => item.id === product.id);
      if (existing) {
        if (existing.qty >= product.stock) return prevCart;
        return prevCart.map(item => 
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prevCart, { ...product, qty: 1 }];
    });
  };

  // Adjust item quantity
  const updateQty = (id, delta) => {
    setCart(prevCart => 
      prevCart.map(item => {
        if (item.id === id) {
          const product = INITIAL_PRODUCTS.find(p => p.id === id);
          const newQty = item.qty + delta;
          if (product && newQty > product.stock) return item;
          return newQty > 0 ? { ...item, qty: newQty } : item;
        }
        return item;
      })
    );
  };

  // Remove item from cart
  const removeFromCart = (id) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  // Financial Calculations
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const taxTotal = cart.reduce((sum, item) => {
    const itemSubtotal = item.price * item.qty;
    return sum + (itemSubtotal * (item.taxRate / 100));
  }, 0);
  
  const discountAmount = (subtotal * (discountPercent || 0)) / 100;
  const grandTotal = Math.max(0, subtotal + taxTotal - discountAmount);

  // Initiate sale process
  const handleInitiateCheckout = () => {
    if (cart.length === 0) return;
    if (paymentMode === 'CASH') {
      executeCheckout();
    } else {
      setShowPaymentModal(true);
    }
  };

  // Finalize sale & send backend trigger
  const executeCheckout = async () => {
    setShowPaymentModal(false);
    setLoading(true);

    const invNum = `INV-${Math.floor(100000 + Math.random() * 900000)}`;
    setLastInvoiceNumber(invNum);

    const payload = {
      invoice_number: invNum,
      customer_name: customerName.trim() || 'Walk-in Customer',
      customer_phone: customerPhone.trim() || 'N/A',
      items: cart.map(item => ({
        id: item.id,
        sku: item.sku,
        name: item.name,
        qty: item.qty,
        price: item.price,
        tax_rate: item.taxRate
      })),
      subtotal: subtotal,
      tax_total: taxTotal,
      discount_percent: discountPercent,
      discount_amount: discountAmount,
      total_amount: grandTotal,
      payment_method: paymentMode
    };

    try {
      await axios.post('http://127.0.0.1:8000/api/v1/checkout', payload);
    } catch (error) {
      console.error('Failed to send checkout payload:', error);
    } finally {
      setLoading(false);
      setInvoiceSuccess(true);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const resetBilling = () => {
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setDiscountPercent(0);
    setPaymentMode('UPI');
    setInvoiceSuccess(false);
    setCardDetails({ number: '', expiry: '', cvv: '', name: '' });
  };

  // Standard UPI URL string format
  const upiString = `upi://pay?pa=billnova@upi&pn=BillNovaPOS&am=${grandTotal.toFixed(2)}&cu=INR`;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Point of Sale (POS)</h1>
          <p className="text-xs text-slate-500 mt-1">Scan products, manage customer cart, and generate tax invoices.</p>
        </div>
        {cart.length > 0 && (
          <button 
            onClick={resetBilling}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200/60 rounded-xl hover:bg-rose-100 transition-colors cursor-pointer"
          >
            <RotateCcw size={14} /> Clear Terminal
          </button>
        )}
      </div>

      {/* Checkout Screen */}
      {!invoiceSuccess ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Product Grid */}
          <div className="lg:col-span-7 space-y-4">
            <div className="glass-card p-4 rounded-2xl relative">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products by Name or SKU..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white/80 border border-purple-200/60 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[580px] overflow-y-auto pr-1">
              {filteredProducts.map((product) => {
                const cartItem = cart.find(item => item.id === product.id);
                const isOutOfStock = product.stock <= 0;
                const isMaxInCart = cartItem && cartItem.qty >= product.stock;

                return (
                  <div 
                    key={product.id}
                    onClick={() => !isOutOfStock && !isMaxInCart && addToCart(product)}
                    className={`glass-card p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      isOutOfStock || isMaxInCart 
                        ? 'opacity-60 cursor-not-allowed border-slate-200' 
                        : 'border-white/80 hover:border-purple-300 hover:shadow-md cursor-pointer group'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                          {product.sku}
                        </span>
                        <span className={`text-[11px] font-semibold ${product.stock < 10 ? 'text-rose-500' : 'text-slate-400'}`}>
                          Stock: {product.stock}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-800 mt-2 group-hover:text-purple-900 transition-colors">
                        {product.name}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-2 border-t border-purple-100/40">
                      <span className="text-base font-extrabold text-slate-900">₹{product.price.toLocaleString('en-IN')}</span>
                      <span className={`text-[11px] font-medium px-2 py-1 rounded-lg transition-colors ${
                        isOutOfStock 
                          ? 'bg-slate-100 text-slate-400' 
                          : isMaxInCart 
                            ? 'bg-amber-100 text-amber-700'
                            : 'text-purple-600 bg-purple-50 group-hover:bg-purple-600 group-hover:text-white'
                      }`}>
                        {isOutOfStock ? 'Out of Stock' : isMaxInCart ? 'Max in Cart' : '+ Add'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Billing Cart & Summary */}
          <div className="lg:col-span-5 space-y-4">
            <div className="glass-card p-4 rounded-2xl space-y-3">
              <h3 className="text-xs font-bold text-purple-950 uppercase tracking-wider">Customer Details</h3>
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="text" 
                  placeholder="Customer Name" 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="glass-input px-3 py-1.5 text-xs w-full focus:outline-none"
                />
                <input 
                  type="text" 
                  placeholder="Mobile Number" 
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="glass-input px-3 py-1.5 text-xs w-full focus:outline-none"
                />
              </div>
            </div>

            <div className="glass-card p-4 rounded-2xl flex flex-col justify-between min-h-[440px]">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-purple-100">
                  <span className="text-xs font-bold text-purple-950 uppercase tracking-wider flex items-center gap-1.5">
                    <ShoppingBag size={14} className="text-purple-600" /> Current Order
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {cart.reduce((sum, i) => sum + i.qty, 0)} Items
                  </span>
                </div>

                <div className="divide-y divide-purple-100/50 max-h-[220px] overflow-y-auto my-2">
                  {cart.length === 0 ? (
                    <div className="py-12 text-center text-slate-400">
                      <p className="text-xs font-medium">Cart is currently empty.</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Click products on the left to start billing.</p>
                    </div>
                  ) : (
                    cart.map((item) => {
                      const product = INITIAL_PRODUCTS.find(p => p.id === item.id);
                      const isMax = product && item.qty >= product.stock;

                      return (
                        <div key={item.id} className="py-2.5 flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">{item.name}</p>
                            <p className="text-[10px] text-slate-500">₹{item.price} + {item.taxRate}% GST</p>
                          </div>

                          <div className="flex items-center gap-1 bg-white/80 border border-purple-100 rounded-lg p-0.5">
                            <button 
                              onClick={() => updateQty(item.id, -1)}
                              className="p-1 hover:bg-purple-100 text-slate-600 rounded cursor-pointer"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="text-xs font-bold w-5 text-center text-slate-800">{item.qty}</span>
                            <button 
                              onClick={() => updateQty(item.id, 1)}
                              disabled={isMax}
                              className="p-1 hover:bg-purple-100 text-slate-600 rounded cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                          <span className="text-xs font-bold text-slate-900 w-16 text-right">
                            ₹{(item.price * item.qty).toLocaleString('en-IN')}
                          </span>

                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Payment Selector & Checkout Footer */}
              <div className="pt-3 border-t border-purple-100/80 space-y-3">
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal</span>
                    <span className="font-semibold text-slate-700">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Total GST / Tax</span>
                    <span className="font-semibold text-slate-700">₹{taxTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-500 pt-1">
                    <span>Discount (%)</span>
                    <input 
                      type="number" 
                      min="0"
                      max="100"
                      value={discountPercent || ''}
                      onChange={(e) => setDiscountPercent(Math.min(100, Math.max(0, Number(e.target.value))))}
                      className="w-14 text-right px-1.5 py-0.5 glass-input text-xs font-semibold focus:outline-none"
                    />
                  </div>
                  <div className="flex justify-between text-slate-900 text-base font-extrabold pt-2 border-t border-purple-100">
                    <span>Grand Total</span>
                    <span className="text-purple-900">₹{grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  {[
                    { id: 'UPI', label: 'UPI / QR', icon: QrCode },
                    { id: 'CASH', label: 'Cash', icon: Banknote },
                    { id: 'CARD', label: 'Card', icon: CreditCard },
                  ].map((mode) => {
                    const Icon = mode.icon;
                    const isActive = paymentMode === mode.id;
                    return (
                      <button
                        key={mode.id}
                        onClick={() => setPaymentMode(mode.id)}
                        className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                          isActive 
                            ? 'bg-purple-600 text-white border-purple-600 shadow-sm' 
                            : 'bg-white/60 text-slate-600 border-purple-100 hover:bg-white'
                        }`}
                      >
                        <Icon size={14} /> {mode.label}
                      </button>
                    );
                  })}
                </div>

                <button
                  disabled={cart.length === 0 || loading}
                  onClick={handleInitiateCheckout}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    "Processing..."
                  ) : paymentMode === 'CASH' ? (
                    <> Complete Cash Sale & Bill <ArrowRight size={15} /> </>
                  ) : (
                    <> Proceed to {paymentMode} Payment <ArrowRight size={15} /> </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* Tax Invoice Document View */
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={resetBilling}
              className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 cursor-pointer"
            >
              ← Back to POS Terminal
            </button>

            <button 
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Printer size={15} /> Print Tax Invoice
            </button>
          </div>

          <div ref={invoiceRef} className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 text-slate-800 space-y-6">
            <div className="flex justify-between items-start border-b border-slate-200 pb-6">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-slate-900">BILLNOVA POS</h2>
                <p className="text-xs text-slate-500 mt-1">Retail & Sales Management System</p>
                <p className="text-xs text-slate-500">GSTIN: 07AAAAA0000A1Z5</p>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-md">
                  PAID ({paymentMode})
                </span>
                <p className="text-xs font-bold text-slate-800 mt-2">{lastInvoiceNumber}</p>
                <p className="text-xs text-slate-500">{new Date().toLocaleDateString('en-IN', { dateStyle: 'medium' })}</p>
              </div>
            </div>

            <div className="text-xs space-y-1">
              <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Billed To:</p>
              <p className="font-bold text-slate-900">{customerName || 'Walk-in Customer'}</p>
              {customerPhone && <p className="text-slate-500">Phone: {customerPhone}</p>}
            </div>

            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <th className="py-2">Item</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Price</th>
                  <th className="py-2 text-right">GST</th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cart.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2.5 font-semibold text-slate-800">{item.name}</td>
                    <td className="py-2.5 text-center font-medium">{item.qty}</td>
                    <td className="py-2.5 text-right font-medium">₹{item.price}</td>
                    <td className="py-2.5 text-right font-medium">{item.taxRate}%</td>
                    <td className="py-2.5 text-right font-bold text-slate-900">
                      ₹{(item.price * item.qty).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t border-slate-200 pt-4 space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST Tax Total:</span>
                <span>₹{taxTotal.toFixed(2)}</span>
              </div>
              {discountPercent > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount ({discountPercent}%):</span>
                  <span>- ₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-900 text-base font-black pt-2 border-t border-slate-200">
                <span>Grand Total:</span>
                <span>₹{grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="text-center pt-6 border-t border-dashed border-slate-200 text-[11px] text-slate-400">
              <p>Thank you for your business!</p>
              <p className="mt-0.5">Computer generated invoice. No signature required.</p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modals (UPI / Card Flow) */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full p-6 space-y-5 relative">
            <button 
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <X size={18} />
            </button>

            {paymentMode === 'UPI' ? (
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 text-purple-700 rounded-2xl mb-1">
                  <QrCode size={24} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">UPI / QR Payment</h3>
                  <p className="text-xs text-slate-500 mt-1">Scan the QR code with any UPI app (GPay, PhonePe, Paytm)</p>
                </div>

                {/* SVG Rendered Dynamic QR Code */}
                <div className="bg-white p-4 rounded-xl border border-purple-100 inline-block shadow-inner">
                  <svg className="w-44 h-44 mx-auto text-purple-900" viewBox="0 0 100 100" fill="currentColor">
                    <rect x="0" y="0" width="100" height="100" fill="white" />
                    {/* Corner Position Markers */}
                    <path d="M10,10 h25 v25 h-25 z M15,15 v15 h15 v-15 z M18,18 h9 v9 h-9 z" />
                    <path d="M65,10 h25 v25 h-25 z M70,15 v15 h15 v-15 z M73,18 h9 v9 h-9 z" />
                    <path d="M10,65 h25 v25 h-25 z M15,70 v15 h15 v-15 z M18,73 h9 v9 h-9 z" />
                    {/* Simulated Data Grid */}
                    <rect x="42" y="10" width="6" height="6" />
                    <rect x="52" y="10" width="6" height="6" />
                    <rect x="42" y="20" width="16" height="6" />
                    <rect x="10" y="42" width="6" height="16" />
                    <rect x="20" y="52" width="16" height="6" />
                    <rect x="42" y="42" width="16" height="16" />
                    <rect x="65" y="42" width="25" height="6" />
                    <rect x="65" y="52" width="6" height="16" />
                    <rect x="75" y="65" width="15" height="6" />
                    <rect x="42" y="65" width="6" height="25" />
                    <rect x="52" y="75" width="16" height="15" />
                    <rect x="75" y="75" width="15" height="15" />
                  </svg>
                  <p className="text-[10px] font-mono text-slate-400 mt-2 truncate max-w-[200px] mx-auto">{upiString}</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Amount to Pay</span>
                  <span className="text-base font-extrabold text-slate-900">₹{grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </div>

                <button 
                  onClick={executeCheckout}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck size={15} /> Simulate Scan & Pay Success
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <div className="p-2.5 bg-purple-100 text-purple-700 rounded-xl">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Card Payment</h3>
                    <p className="text-[11px] text-slate-500">Swipe, dip, or enter card details</p>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Cardholder Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Rahul Sharma"
                      value={cardDetails.name}
                      onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Card Number</label>
                    <input 
                      type="text" 
                      maxLength={19}
                      placeholder="4000 0000 0000 0000"
                      value={cardDetails.number}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
                        setCardDetails({ ...cardDetails, number: val });
                      }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 text-xs font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Expiry Date</label>
                      <input 
                        type="text" 
                        maxLength={5}
                        placeholder="MM/YY"
                        value={cardDetails.expiry}
                        onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">CVV</label>
                      <input 
                        type="password" 
                        maxLength={3}
                        placeholder="•••"
                        value={cardDetails.cvv}
                        onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Amount to Charge</span>
                  <span className="text-base font-extrabold text-slate-900">₹{grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </div>

                <button 
                  onClick={executeCheckout}
                  disabled={!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-200 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck size={15} /> Process Charge & Complete Sale
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};