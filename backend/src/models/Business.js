const mongoose = require('mongoose');

const BusinessSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  logo: {
    type: String,
    default: '',
  },
  currency: {
    type: String,
    default: 'USD',
  },
  taxSettings: {
    rate: { type: Number, default: 0 }, // in percentage, e.g. 10 for 10%
    type: { type: String, default: 'VAT' }, // e.g. VAT, GST, Sales Tax
    inclusive: { type: Boolean, default: false }
  },
  address: {
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String,
  },
  timeZone: {
    type: String,
    default: 'UTC',
  },
  subscriptionPlan: {
    type: String,
    enum: ['Free', 'Professional', 'Enterprise'],
    default: 'Free',
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'pending'],
    default: 'active',
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Business', BusinessSchema);
