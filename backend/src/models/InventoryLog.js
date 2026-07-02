const mongoose = require('mongoose');

const InventoryLogSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true,
  },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    default: null,
  },
  type: {
    type: String,
    enum: ['StockIn', 'StockOut', 'Adjustment', 'Transfer', 'Sale', 'Refund'],
    required: true,
  },
  quantity: {
    type: Number,
    required: true, // change quantity (positive for addition, negative for deduction)
  },
  beforeQuantity: {
    type: Number,
    required: true,
  },
  afterQuantity: {
    type: Number,
    required: true,
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId, // can link to Order, PurchaseOrder, etc.
    default: null,
  },
  reason: {
    type: String,
    default: '',
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('InventoryLog', InventoryLogSchema);
