const express = require('express');
const router = express.Router();
const { 
  getDashboardOverview, 
  downloadInvoicePDF, 
  getActivityLogs,
  getBusinessDetails,
  updateBusinessDetails
} = require('../controllers/reportController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/dashboard', authenticate, getDashboardOverview);
router.get('/invoice/:orderId/pdf', authenticate, downloadInvoicePDF);
router.get('/activity-logs', authenticate, authorize('BusinessOwner', 'InventoryManager'), getActivityLogs);
router.get('/business', authenticate, getBusinessDetails);
router.put('/business', authenticate, authorize('BusinessOwner'), updateBusinessDetails);

module.exports = router;
