const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
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
  description: {
    type: String,
    default: '',
  }
}, {
  timestamps: true
});

// Compound index to ensure category names are unique per business
CategorySchema.index({ businessId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Category', CategorySchema);
