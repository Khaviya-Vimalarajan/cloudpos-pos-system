const mongoose = require('mongoose');

const SupplierSchema = new mongoose.Schema({
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
  contactName: {
    type: String,
    default: '',
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    default: '',
  },
  phone: {
    type: String,
    trim: true,
    default: '',
  },
  address: {
    type: String,
    default: '',
  },
  outstandingPayment: {
    type: Number,
    default: 0, // balance owed by the business to the supplier
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Supplier', SupplierSchema);
