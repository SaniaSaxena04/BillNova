const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: 2,
      maxlength: 100
    },
    barcode: {
      type: String,
      required: [true, 'Barcode is required'],
      unique: true,
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Selling price is required'],
      min: [0.01, 'Price must be greater than 0']
    },
    cost_price: {
      type: Number,
      required: [true, 'Cost price is required'],
      min: [0.01, 'Cost price must be greater than 0']
    },
    stock_quantity: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock quantity cannot be negative'],
      default: 0
    },
    reorder_level: {
      type: Number,
      default: 10,
      min: [0, 'Reorder level cannot be negative']
    },
    unit: {
      type: String,
      default: 'pcs',
      trim: true
    },
    description: {
      type: String,
      default: null,
      trim: true
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Dynamic virtual attribute: calculates low stock status on the fly
productSchema.virtual('is_low_stock').get(function () {
  return this.stock_quantity <= this.reorder_level;
});

module.exports = mongoose.model('Product', productSchema);