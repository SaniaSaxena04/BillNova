const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true
    },
    email: {
      type: String,
      default: null,
      lowercase: true,
      trim: true
    },
    segment: {
      type: String,
      default: 'New Customer'
    },
    rfm_score: {
      type: String,
      default: '1-1-1'
    },
    churn_risk: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Low'
    },
    total_spent: {
      type: Number,
      default: 0
    },
    total_orders: {
      type: Number,
      default: 0
    },
    last_visit: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

module.exports = mongoose.model('Customer', customerSchema);