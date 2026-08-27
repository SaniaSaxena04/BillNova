const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      default: Date.now,
      unique: true
    },
    predicted_revenue: {
      type: Number,
      default: 0
    },
    predicted_orders: {
      type: Number,
      default: 0
    },
    top_selling_product: {
      type: String,
      default: ''
    },
    sentiment_score: {
      overall: { type: String, default: 'Positive' },
      positive_percentage: { type: Number, default: 80 }
    },
    flagged_fraud_count: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

module.exports = mongoose.model('Analytics', analyticsSchema);