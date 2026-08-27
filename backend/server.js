require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Updated Model Imports (pointing to lower-case filenames matching your JS schemas)
const Product = require('./app/models/product');
const Customer = require('./app/models/customer');
const Invoice = require('./app/models/bill'); // Maps Bill schema as Invoice
const { initTelegramBot } = require('./app/services/bot');

const app = express();
const PORT = process.env.PORT || 8000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/billnova';

// Essential Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB & Seed Default Data
mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('🍃 Connected to MongoDB');
    await seedInitialData();
  })
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

async function seedInitialData() {
  const productCount = await Product.countDocuments();
  if (productCount === 0) {
    await Product.insertMany([
      { name: 'Wireless Mouse', price: 1299, cost_price: 800, barcode: 'SKU-99', stock_quantity: 5, category: 'Electronics' },
      { name: 'Mechanical Keyboard', price: 3499, cost_price: 2200, barcode: 'SKU-100', stock_quantity: 15, category: 'Electronics' },
      { name: 'USB-C Cable', price: 299, cost_price: 100, barcode: 'SKU-101', stock_quantity: 0, category: 'Electronics' },
      { name: 'Organic Milk 1L', price: 75, cost_price: 50, barcode: 'SKU-501', stock_quantity: 25, category: 'Dairy' },
      { name: 'Greek Yogurt', price: 120, cost_price: 80, barcode: 'SKU-502', stock_quantity: 12, category: 'Dairy' }
    ]);
    console.log('🌱 Seeded default products.');
  }

  const customerCount = await Customer.countDocuments();
  if (customerCount === 0) {
    await Customer.create({
      name: 'John Doe',
      phone: '9876543210',
      segment: 'Champions (High Value & High Frequency)',
      rfm_score: '5-4-5',
      churn_risk: 'Low',
      total_spent: 12500
    });
    console.log('🌱 Seeded default customer.');
  }
}

// --- API ROUTES ---

// 1. Products API
app.get(['/api/v1/products', '/products'], async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { barcode: { $regex: search, $options: 'i' } }
        ]
      };
    }
    const products = await Product.find(query);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Add Product Endpoint
app.post(['/api/v1/products', '/products'], async (req, res) => {
  try {
    const { name, price, cost_price, barcode, sku, stock_quantity, stock, category } = req.body;
    const finalBarcode = barcode || sku;
    const finalStock = stock_quantity !== undefined ? stock_quantity : stock;

    if (!name || price === undefined || !finalBarcode || finalStock === undefined) {
      return res.status(400).json({ error: 'Missing required product details.' });
    }

    const product = await Product.create({
      name,
      price: Number(price),
      cost_price: Number(cost_price || price * 0.7),
      barcode: finalBarcode,
      stock_quantity: Number(finalStock),
      category: category || 'General'
    });
    res.status(201).json({ message: 'Product created successfully', product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Customers API
app.get(['/api/v1/customers/:phone', '/customers/:phone'], async (req, res) => {
  try {
    const customer = await Customer.findOne({ phone: req.params.phone });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Inventory Alerts API
app.get(['/api/v1/inventory/alerts', '/inventory/alerts'], async (req, res) => {
  try {
    const outOfStock = await Product.find({ stock_quantity: 0 });
    const lowStock = await Product.find({ stock_quantity: { $gt: 0, $lte: 15 } });
    res.json({ outOfStock, lowStock });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Daily Report API
app.get(['/api/v1/reports/daily', '/reports/daily'], async (req, res) => {
  try {
    const invoices = await Invoice.find({});
    const totalRevenue = invoices.reduce((acc, inv) => acc + (inv.total_amount || 0), 0);
    const totalOrders = invoices.length;
    
    const upiTotal = invoices.filter(i => i.payment_method === 'UPI').reduce((a, b) => a + (b.total_amount || 0), 0);
    const cashTotal = invoices.filter(i => i.payment_method === 'Cash').reduce((a, b) => a + (b.total_amount || 0), 0);
    const cardTotal = invoices.filter(i => i.payment_method === 'Card').reduce((a, b) => a + (b.total_amount || 0), 0);

    res.json({
      totalRevenue,
      totalOrders,
      upiTotal,
      cashTotal,
      cardTotal,
      aov: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Invoices API
app.post(['/api/v1/invoices', '/invoices'], async (req, res) => {
  try {
    const { items, totalAmount, paymentMethod, subtotal } = req.body;
    const invoice_number = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const invoice = await Invoice.create({
      invoice_number,
      subtotal: subtotal || totalAmount || 2598,
      total_amount: totalAmount || 2598,
      payment_method: paymentMethod || 'UPI',
      items: items || []
    });

    res.status(201).json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- DYNAMIC AI ENDPOINTS ---

// AI 1: Sales Prediction
app.get(['/api/v1/ai/predict-sales', '/ai/predict-sales'], async (req, res) => {
  try {
    const topProduct = await Product.findOne().sort({ stock_quantity: -1 });
    res.json({
      predictedRevenue: 45000,
      predictedOrders: 120,
      topProduct: topProduct ? topProduct.name : 'N/A'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI 2: Expiry Risk
app.get(['/api/v1/ai/expiry-risk', '/ai/expiry-risk'], async (req, res) => {
  try {
    const highRiskItems = await Product.find({ category: 'Dairy' });
    res.json({ highRiskItems });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI 3: Smart Inventory
app.get(['/api/v1/ai/inventory-recommendations', '/ai/inventory-recommendations'], async (req, res) => {
  try {
    const lowStock = await Product.find({ stock_quantity: { $lte: 10 } });
    const reorderAlerts = lowStock.map(p => ({
      name: p.name,
      barcode: p.barcode,
      currentStock: p.stock_quantity,
      suggestedReorderQty: 50
    }));
    res.json({ reorderAlerts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI 4: Trending Products
app.get(['/api/v1/ai/trending', '/ai/trending'], (req, res) => {
  res.json({
    trendingProducts: [
      { name: 'Mechanical Keyboard', growthRate: '+145%', unitsSoldThisWeek: 85 },
      { name: 'Wireless Mouse', growthRate: '+80%', unitsSoldThisWeek: 120 }
    ]
  });
});

// AI 5: Discounts
app.get(['/api/v1/ai/discounts', '/ai/discounts'], async (req, res) => {
  try {
    const expiring = await Product.find({ category: 'Dairy' });
    const discounts = expiring.map(p => ({
      name: p.name,
      barcode: p.barcode,
      discountPercent: 25,
      reason: 'Near Expiry'
    }));
    res.json({ discounts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI 6: Customer Segmentation
app.get(['/api/v1/customers/segmentation/:phone', '/customers/segmentation/:phone'], async (req, res) => {
  try {
    const customer = await Customer.findOne({ phone: req.params.phone });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI 7: Product Cross-Sell
app.get(['/api/v1/ai/product-recommendations', '/ai/product-recommendations'], (req, res) => {
  res.json({
    crossSellPairs: [
      { baseItem: 'Wireless Mouse', recommendedItem: 'Mousepad XL', confidence: '92%' },
      { baseItem: 'Mechanical Keyboard', recommendedItem: 'Wrist Rest', confidence: '84%' }
    ]
  });
});

// AI 8: Fraud Detection
app.get(['/api/v1/ai/fraud-alerts', '/ai/fraud-alerts'], (req, res) => {
  res.json({
    flaggedTransactions: [
      { invoiceId: 'INV-2026-88', amount: 45000, reason: 'Unusual bulk discount applied', riskLevel: 'High' }
    ]
  });
});

// AI 9: Customer Sentiment Analysis
app.get(['/api/v1/ai/sentiment-summary', '/ai/sentiment-summary'], (req, res) => {
  res.json({
    overallSentiment: 'Positive (84%)',
    topComplaints: ['Slight billing delay during peak hours'],
    topPraise: ['Friendly staff', 'Fast checkout']
  });
});

// Catch-all route
app.use((req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.url}` });
});

// Start express server and launch bot
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  initTelegramBot();
});