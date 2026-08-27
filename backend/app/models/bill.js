const mongoose = require('mongoose');

const billItemSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: { type: String, required: true },
  barcode: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unit_price: { type: Number, required: true },
  total_price: { type: Number, required: true }
});

const billSchema = new mongoose.Schema(
  {
    invoice_number: {
      type: String,
      required: true,
      unique: true
    },
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      default: null
    },
    customer_phone: {
      type: String,
      default: null
    },
    items: [billItemSchema],
    subtotal: {
      type: Number,
      required: true
    },
    tax_amount: {
      type: Number,
      default: 0
    },
    discount_amount: {
      type: Number,
      default: 0
    },
    total_amount: {
      type: Number,
      required: true
    },
    payment_method: {
      type: String,
      enum: ['UPI', 'Cash', 'Card'],
      default: 'UPI'
    },
    payment_status: {
      type: String,
      enum: ['Paid', 'Pending', 'Failed', 'Refunded'],
      default: 'Paid'
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

module.exports = mongoose.model('Bill', billSchema);