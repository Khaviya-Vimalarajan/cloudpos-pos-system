const express = require('express');
const router = express.Router();
const { 
  getSuppliers, createSupplier, updateSupplier, deleteSupplier 
} = require('../controllers/supplierController');
const { authenticate, authorize } = require('../middleware/auth');

router.route('/')
  .get(authenticate, getSuppliers)
  .post(authenticate, authorize('BusinessOwner', 'InventoryManager'), createSupplier);

router.route('/:id')
  .put(authenticate, authorize('BusinessOwner', 'InventoryManager'), updateSupplier)
  .delete(authenticate, authorize('BusinessOwner'), deleteSupplier);

module.exports = router;
