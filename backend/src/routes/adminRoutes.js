const express = require('express');
const router = express.Router();
const { getTenants, updateTenantStatus, getPlatformMetrics, getSystemLogs, getAdminNotifications } = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/tenants', authenticate, authorize('SuperAdmin'), getTenants);
router.put('/tenants/:id/status', authenticate, authorize('SuperAdmin'), updateTenantStatus);
router.get('/metrics', authenticate, authorize('SuperAdmin'), getPlatformMetrics);
router.get('/logs', authenticate, authorize('SuperAdmin'), getSystemLogs);
router.get('/notifications', authenticate, authorize('SuperAdmin'), getAdminNotifications);

module.exports = router;
