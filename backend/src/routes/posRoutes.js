const express = require('express');
const router = express.Router();
const { checkout, getOrders } = require('../controllers/posController');
const { authenticate } = require('../middleware/auth');
const { orderValidation } = require('../middleware/validator');

router.post('/checkout', authenticate, orderValidation, checkout);
router.get('/orders', authenticate, getOrders);

module.exports = router;
