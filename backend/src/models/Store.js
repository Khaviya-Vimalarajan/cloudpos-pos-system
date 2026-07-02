const mongoose = require('mongoose');

const StoreSchema = new mongoose.Schema({
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
  address: {
    type: String,
    default: '',
  },
  phone: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    enum: ['Store', 'Warehouse'],
    default: 'Store',
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Store', StoreSchema);
