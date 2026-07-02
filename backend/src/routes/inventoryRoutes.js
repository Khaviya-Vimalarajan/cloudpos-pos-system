const express = require('express');
const router = express.Router();
const { 
  getStores, createStore, adjustStock, transferStock, getLowStockAlerts, getInventoryLogs 
} = require('../controllers/inventoryController');
const { authenticate, authorize } = require('../middleware/auth');

router.route('/stores')
  .get(authenticate, getStores)
  .post(authenticate, authorize('BusinessOwner'), createStore);

router.post('/adjust', authenticate, authorize('BusinessOwner', 'InventoryManager'), adjustStock);
router.post('/transfer', authenticate, authorize('BusinessOwner', 'InventoryManager'), transferStock);
router.get('/low-stock', authenticate, getLowStockAlerts);
router.get('/logs', authenticate, getInventoryLogs);

module.exports = router;
