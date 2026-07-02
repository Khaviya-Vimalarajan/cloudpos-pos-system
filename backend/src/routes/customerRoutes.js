const express = require('express');
const router = express.Router();
const { 
  getCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer 
} = require('../controllers/customerController');
const { authenticate, authorize } = require('../middleware/auth');

router.route('/')
  .get(authenticate, getCustomers)
  .post(authenticate, authorize('BusinessOwner', 'Cashier'), createCustomer);

router.route('/:id')
  .get(authenticate, getCustomerById)
  .put(authenticate, authorize('BusinessOwner', 'Cashier'), updateCustomer)
  .delete(authenticate, authorize('BusinessOwner'), deleteCustomer);

module.exports = router;
