const { Telegraf } = require('telegraf');
const axios = require('axios');

const API_BASE = process.env.API_BASE_URL || 'http://localhost:8000/api/v1';

function escapeMarkdown(text) {
  if (text === undefined || text === null) return '';
  return String(text).replace(/[_*\[\]()~`>#+\-=|{}.!]/g, '\\$&');
}

function initTelegramBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.warn('⚠️ TELEGRAM_BOT_TOKEN not found in .env');
    return;
  }

  const bot = new Telegraf(token);

  // Help / Start Command (Fully Safe Variant)
  bot.start((ctx) => {
    const helpMsg = 
      `🆘 *BillNova Bot Support*\n\n` +
      `/start - Re-initialize bot\n` +
      `/searchproduct - Search items\n` +
      `/customer - Search customer profile\n` +
      `/stock - Check low stock\n` +
      `/report - Business summary\n\n` +
      `*🤖 AI Features:*\n` +
      `/predictsales - 7-Day AI Sales Forecast\n` +
      `/expiry - Expiry Risk Prediction\n` +
      `/smartreorder - Smart Inventory Tips\n` +
      `/trending - Fast-moving items\n` +
      `/discounts - AI Discount Suggestions\n` +
      `/segment <phone> - Customer RFM Segment\n` +
      `/crosssell - Product Recommendations\n` +
      `/fraud - Fraud Alerts\n` +
      `/sentiment - Customer Sentiment`;

    // Automatically escape reserved symbols while preserving formatting
    ctx.replyWithMarkdownV2(
      helpMsg.replace(/([_\*\[\]()~`>#+\-=|{}.!])/g, '\\$1')
    );
  });

  // 1. Search Product
  bot.command('searchproduct', async (ctx) => {
    const query = ctx.message.text.split(' ').slice(1).join(' ').trim();
    if (!query) return ctx.reply('🔍 Usage: /searchproduct Mouse');

    try {
      const res = await axios.get(`${API_BASE}/products`, { params: { search: query } });
      const products = res.data;

      if (!Array.isArray(products) || products.length === 0) {
        return ctx.reply(`No products found matching "${query}".`);
      }

      let msg = '🔎 *Search Results:*\n\n';
      products.forEach((p) => {
        msg += `• *${escapeMarkdown(p.name)}* \\(${escapeMarkdown(p.sku)}\\)\n  Price: ₹${escapeMarkdown(p.price)} \\| Stock: ${escapeMarkdown(p.stock)}\n\n`;
      });
      ctx.replyWithMarkdownV2(msg);
    } catch (err) {
      ctx.reply('Failed to fetch product details.');
    }
  });

  // 2. Customer Lookup
  bot.command('customer', async (ctx) => {
    const phone = ctx.message.text.split(' ')[1]?.trim();
    if (!phone) return ctx.reply('Usage: /customer 9876543210');

    try {
      const res = await axios.get(`${API_BASE}/customers/${phone}`);
      const c = res.data;
      ctx.replyWithMarkdownV2(
        `👤 *Customer Profile*\n\n` +
        `*Name:* ${escapeMarkdown(c.name)}\n` +
        `*Phone:* ${escapeMarkdown(c.phone)}\n` +
        `*Segment:* ${escapeMarkdown(c.segment)}\n` +
        `*Total Spent:* ₹${escapeMarkdown(c.totalSpent)}`
      );
    } catch (err) {
      ctx.reply('Customer not found.');
    }
  });

  // 3. Stock Alerts
  bot.command('stock', async (ctx) => {
    try {
      const res = await axios.get(`${API_BASE}/inventory/alerts`);
      const { outOfStock = [], lowStock = [] } = res.data;

      let msg = '🚨 *Stock Alerts*\n\n*Out of Stock:*\n';
      outOfStock.forEach(i => msg += `• ${escapeMarkdown(i.name)}\n`);

      msg += '\n*Low Stock:*\n';
      lowStock.forEach(i => msg += `• ${escapeMarkdown(i.name)} \\(${escapeMarkdown(i.stock)} left\\)\n`);

      ctx.replyWithMarkdownV2(msg);
    } catch (err) {
      ctx.reply('Failed to fetch stock alerts.');
    }
  });

  // 4. Daily Summary Report
  bot.command('report', async (ctx) => {
    try {
      const res = await axios.get(`${API_BASE}/reports/daily`);
      const r = res.data;
      ctx.replyWithMarkdownV2(
        `📊 *Daily Sales Report*\n\n` +
        `*Total Revenue:* ₹${escapeMarkdown(r.totalRevenue)}\n` +
        `*Total Orders:* ${escapeMarkdown(r.totalOrders)}\n` +
        `*UPI:* ₹${escapeMarkdown(r.upiTotal)} \\| *Cash:* ₹${escapeMarkdown(r.cashTotal)} \\| *Card:* ₹${escapeMarkdown(r.cardTotal)}`
      );
    } catch (err) {
      ctx.reply('Failed to fetch report.');
    }
  });

  // --- AI COMMANDS ---

  // AI 1: Sales Forecast
  bot.command('predictsales', async (ctx) => {
    try {
      const res = await axios.get(`${API_BASE}/ai/predict-sales`);
      const d = res.data;
      ctx.replyWithMarkdownV2(
        `📈 *7\\-Day AI Sales Forecast*\n\n` +
        `• *Predicted Revenue:* ₹${escapeMarkdown(d.predictedRevenue)}\n` +
        `• *Expected Orders:* ${escapeMarkdown(d.predictedOrders)}\n` +
        `• *Top Demand Item:* ${escapeMarkdown(d.topProduct)}`
      );
    } catch (err) {
      ctx.reply('Failed to fetch sales forecast.');
    }
  });

  // AI 2: Expiry Risk
  bot.command('expiry', async (ctx) => {
    try {
      const res = await axios.get(`${API_BASE}/ai/expiry-risk`);
      const items = res.data.highRiskItems || [];
      let msg = '⏳ *Near\\-Expiry Risk Alert*\n\n';
      items.forEach((i) => {
        msg += `• *${escapeMarkdown(i.name)}* \\(${escapeMarkdown(i.sku)}\\)\n  Expires in: ${escapeMarkdown(i.daysToExpiry)} days \\| Stock: ${escapeMarkdown(i.stock)}\n\n`;
      });
      ctx.replyWithMarkdownV2(msg);
    } catch (err) {
      ctx.reply('Failed to fetch expiry risk.');
    }
  });

  // AI 3: Smart Reorder
  bot.command('smartreorder', async (ctx) => {
    try {
      const res = await axios.get(`${API_BASE}/ai/inventory-recommendations`);
      const items = res.data.reorderAlerts || [];
      let msg = '📦 *AI Smart Reorder Suggestions*\n\n';
      items.forEach((i) => {
        msg += `• *${escapeMarkdown(i.name)}*\n  Current: ${escapeMarkdown(i.currentStock)} \\| Suggested Reorder: *${escapeMarkdown(i.suggestedReorderQty)}*\n\n`;
      });
      ctx.replyWithMarkdownV2(msg);
    } catch (err) {
      ctx.reply('Failed to fetch inventory recommendations.');
    }
  });

  // AI 4: Trending
  bot.command('trending', async (ctx) => {
    try {
      const res = await axios.get(`${API_BASE}/ai/trending`);
      const items = res.data.trendingProducts || [];
      let msg = '🔥 *Trending Products*\n\n';
      items.forEach((i) => {
        msg += `• *${escapeMarkdown(i.name)}*\n  Growth: ${escapeMarkdown(i.growthRate)} \\| Sold: ${escapeMarkdown(i.unitsSoldThisWeek)} units\n\n`;
      });
      ctx.replyWithMarkdownV2(msg);
    } catch (err) {
      ctx.reply('Failed to fetch trending products.');
    }
  });

  // AI 5: Discount Suggestions
  bot.command('discounts', async (ctx) => {
    try {
      const res = await axios.get(`${API_BASE}/ai/discounts`);
      const items = res.data.discounts || [];
      let msg = '🏷️ *AI Smart Discounts*\n\n';
      items.forEach((i) => {
        msg += `• *${escapeMarkdown(i.name)}*: Suggest *${escapeMarkdown(i.discountPercent)}% OFF*\n  Reason: ${escapeMarkdown(i.reason)}\n\n`;
      });
      ctx.replyWithMarkdownV2(msg);
    } catch (err) {
      ctx.reply('Failed to fetch discount recommendations.');
    }
  });

  // AI 6: Customer Segment
  bot.command('segment', async (ctx) => {
    const phone = ctx.message.text.split(' ')[1]?.trim();
    if (!phone) return ctx.reply('Usage: /segment 9876543210');

    try {
      const res = await axios.get(`${API_BASE}/customers/segmentation/${phone}`);
      const c = res.data;
      ctx.replyWithMarkdownV2(
        `🎯 *Customer Segmentation*\n\n` +
        `*Customer:* ${escapeMarkdown(c.name)}\n` +
        `*Segment:* ${escapeMarkdown(c.segment)}\n` +
        `*RFM Score:* ${escapeMarkdown(c.rfmScore)}\n` +
        `*Churn Risk:* ${escapeMarkdown(c.churnRisk)}`
      );
    } catch (err) {
      ctx.reply('Failed to fetch customer segment.');
    }
  });

  // AI 7: Cross-Sell Recommendations
  bot.command('crosssell', async (ctx) => {
    try {
      const res = await axios.get(`${API_BASE}/ai/product-recommendations`);
      const pairs = res.data.crossSellPairs || [];
      let msg = '🔗 *Cross\\-Sell Suggestions*\n\n';
      pairs.forEach((p) => {
        msg += `• When buying *${escapeMarkdown(p.baseItem)}* ➔ Suggest *${escapeMarkdown(p.recommendedItem)}* \\(${escapeMarkdown(p.confidence)} match\\)\n\n`;
      });
      ctx.replyWithMarkdownV2(msg);
    } catch (err) {
      ctx.reply('Failed to fetch cross-sell recommendations.');
    }
  });

  // AI 8: Fraud Detection
  bot.command('fraud', async (ctx) => {
    try {
      const res = await axios.get(`${API_BASE}/ai/fraud-alerts`);
      const flags = res.data.flaggedTransactions || [];
      let msg = '⚠️ *AI Fraud Alerts*\n\n';
      flags.forEach((f) => {
        msg += `• *${escapeMarkdown(f.invoiceId)}* \\| Amount: ₹${escapeMarkdown(f.amount)}\n  Risk: *${escapeMarkdown(f.riskLevel)}* \\| Reason: ${escapeMarkdown(f.reason)}\n\n`;
      });
      ctx.replyWithMarkdownV2(msg);
    } catch (err) {
      ctx.reply('Failed to fetch fraud alerts.');
    }
  });

  // AI 9: Customer Sentiment
  bot.command('sentiment', async (ctx) => {
    try {
      const res = await axios.get(`${API_BASE}/ai/sentiment-summary`);
      const s = res.data;
      ctx.replyWithMarkdownV2(
        `💬 *Customer Sentiment Summary*\n\n` +
        `*Overall:* ${escapeMarkdown(s.overallSentiment)}\n` +
        `*Top Praise:* ${escapeMarkdown(s.topPraise.join(', '))}\n` +
        `*Top Issues:* ${escapeMarkdown(s.topComplaints.join(', '))}`
      );
    } catch (err) {
      ctx.reply('Failed to fetch sentiment.');
    }
  });

  bot.launch();
  console.log('🤖 Telegram bot launched successfully!');
}

module.exports = { initTelegramBot };