const express = require('express');
const router = express.Router();
const { 
  getEmployees, createEmployee, updateEmployee, deleteEmployee 
} = require('../controllers/employeeController');
const { authenticate, authorize } = require('../middleware/auth');

router.route('/')
  .get(authenticate, authorize('BusinessOwner'), getEmployees)
  .post(authenticate, authorize('BusinessOwner'), createEmployee);

router.route('/:id')
  .put(authenticate, authorize('BusinessOwner'), updateEmployee)
  .delete(authenticate, authorize('BusinessOwner'), deleteEmployee);

module.exports = router;
