const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  sku: {
    type: String,
    required: true,
    trim: true,
  },
  barcode: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  cost: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  minStockAlert: {
    type: Number,
    default: 5,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
  },
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    default: null,
  },
  image: {
    type: String,
    default: '',
  },
  variants: [
    {
      name: String, // e.g. "Size"
      options: [String], // e.g. ["Small", "Medium", "Large"]
    }
  ],
  description: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['active', 'draft', 'archived'],
    default: 'active',
  }
}, {
  timestamps: true
});

// Ensure SKU and Barcode are unique within a single business tenant
ProductSchema.index({ businessId: 1, sku: 1 }, { unique: true });
ProductSchema.index({ businessId: 1, barcode: 1 }, { unique: true });

module.exports = mongoose.model('Product', ProductSchema);
