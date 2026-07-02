const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  sku: String,
  price: {
    type: Number,
    required: true,
  },
  cost: {
    type: Number,
    required: true,
    default: 0,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  discount: {
    type: Number,
    default: 0, // item-level discount value
  },
  tax: {
    type: Number,
    default: 0, // item-level tax value
  },
  total: {
    type: Number,
    required: true,
  }
});

const OrderPaymentSchema = new mongoose.Schema({
  method: {
    type: String,
    enum: ['Cash', 'Card', 'QR'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  transactionId: {
    type: String,
    default: '',
  },
  date: {
    type: Date,
    default: Date.now,
  }
});

const OrderSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true,
  },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    default: null,
  },
  cashierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    default: null,
  },
  invoiceNumber: {
    type: String,
    required: true,
  },
  items: [OrderItemSchema],
  subTotal: {
    type: Number,
    required: true,
    default: 0,
  },
  discountAmount: {
    type: Number,
    default: 0, // invoice-level discount
  },
  taxAmount: {
    type: Number,
    default: 0, // invoice-level tax
  },
  totalAmount: {
    type: Number,
    required: true,
    default: 0,
  },
  totalCost: {
    type: Number,
    required: true,
    default: 0,
  },
  profit: {
    type: Number,
    required: true,
    default: 0, // calculated as totalAmount - totalCost
  },
  paymentStatus: {
    type: String,
    enum: ['Paid', 'PartiallyPaid', 'Unpaid', 'Refunded'],
    default: 'Paid',
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Card', 'QR', 'Split'],
    default: 'Cash',
  },
  payments: [OrderPaymentSchema],
  notes: {
    type: String,
    default: '',
  }
}, {
  timestamps: true
});

// Ensure invoice numbers are unique per business tenant
OrderSchema.index({ businessId: 1, invoiceNumber: 1 }, { unique: true });

module.exports = mongoose.model('Order', OrderSchema);
