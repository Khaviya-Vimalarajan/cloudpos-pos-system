const express = require('express');
const router = express.Router();
const { 
  registerBusiness, 
  login, 
  refresh, 
  logout, 
  forgotPassword, 
  resetPassword,
  updateProfile
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { registerValidation, loginValidation } = require('../middleware/validator');

router.post('/register', registerValidation, registerBusiness);
router.post('/login', loginValidation, login);
router.post('/refresh', refresh);
router.post('/logout', authenticate, logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.put('/profile', authenticate, updateProfile);

module.exports = router;
