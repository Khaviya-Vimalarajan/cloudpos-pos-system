const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
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
  loyaltyPoints: {
    type: Number,
    default: 0,
    min: 0,
  },
  creditBalance: {
    type: Number,
    default: 0, // customer's outstanding balance / credit with the business
  },
  notes: {
    type: String,
    default: '',
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Customer', CustomerSchema);
