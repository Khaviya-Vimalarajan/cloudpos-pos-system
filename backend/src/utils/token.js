const jwt = require('jsonwebtoken');

/**
 * Generate Access Token (short-lived)
 * @param {Object} user - User document
 * @returns {string} - JWT Access Token
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      businessId: user.businessId
    },
    process.env.JWT_SECRET || 'cp_access_secret_99881177@@!!',
    { expiresIn: '15m' }
  );
};

/**
 * Generate Refresh Token (long-lived)
 * @param {Object} user - User document
 * @returns {string} - JWT Refresh Token
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET || 'cp_refresh_secret_11223344##$$',
    { expiresIn: '7d' }
  );
};

module.exports = {
  generateAccessToken,
  generateRefreshToken
};
