const { validationResult, body } = require('express-validator');

// Generic validation runner middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation error',
      errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
    });
  }
  next();
};

const registerValidation = [
  body('businessName').notEmpty().withMessage('Business name is required').trim(),
  body('ownerName').notEmpty().withMessage('Owner name is required').trim(),
  body('email').isEmail().withMessage('Provide a valid email address').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  validate
];

const loginValidation = [
  body('email').isEmail().withMessage('Provide a valid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  validate
];

const productValidation = [
  body('name').notEmpty().withMessage('Product name is required').trim(),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('cost').isFloat({ min: 0 }).withMessage('Cost must be a positive number'),
  body('stock').isInt({ min: 0 }).withMessage('Initial stock must be an integer >= 0'),
  validate
];

const orderValidation = [
  body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  body('items.*.productId').notEmpty().withMessage('Product ID is required for items'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('paymentMethod').isIn(['Cash', 'Card', 'QR', 'Split']).withMessage('Invalid payment method'),
  validate
];

module.exports = {
  registerValidation,
  loginValidation,
  productValidation,
  orderValidation
};
