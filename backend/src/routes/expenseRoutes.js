const express = require('express');
const router = express.Router();
const { getExpenses, createExpense, deleteExpense } = require('../controllers/expenseController');
const { authenticate, authorize } = require('../middleware/auth');

router.route('/')
  .get(authenticate, getExpenses)
  .post(authenticate, authorize('BusinessOwner'), createExpense);

router.delete('/:id', authenticate, authorize('BusinessOwner'), deleteExpense);

module.exports = router;
