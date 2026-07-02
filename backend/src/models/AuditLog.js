const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: false,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  userName: {
    type: String,
    required: true,
  },
  userRole: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    required: true, // e.g. "PRODUCT_CREATE", "SALE_REFUND", "SETTINGS_UPDATE"
  },
  details: {
    type: String,
    default: '',
  },
  ipAddress: {
    type: String,
    default: '',
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);
