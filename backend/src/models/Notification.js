const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    // businessId is null only for platform-wide notifications
    required: false,
    index: true,
  },
  type: {
    type: String,
    enum: ['LowStock', 'Subscription', 'Payment', 'Order', 'General'],
    default: 'General',
  },
  message: {
    type: String,
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', NotificationSchema);
