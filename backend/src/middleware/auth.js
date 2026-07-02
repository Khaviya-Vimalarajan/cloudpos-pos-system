const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Business = require('../models/Business');

// Authenticate JWT Token
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'cp_access_secret_99881177@@!!');
    
    // Fetch user to verify status
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User no longer exists.' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ message: 'User account is inactive. Contact administrator.' });
    }

    // If tenant user, verify business is active
    if (user.role !== 'SuperAdmin' && user.businessId) {
      const business = await Business.findById(user.businessId);
      if (!business) {
        return res.status(404).json({ message: 'Business not found.' });
      }
      if (business.status === 'suspended') {
        return res.status(403).json({ message: 'Your business account has been suspended.' });
      }
      req.businessId = user.businessId;
    }

    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      businessId: user.businessId
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired.', code: 'TOKEN_EXPIRED' });
    }
    res.status(401).json({ message: 'Invalid token.' });
  }
};

// Authorize roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized. Please login.' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Forbidden. Role '${req.user.role}' is not authorized to access this resource.` 
      });
    }
    
    next();
  };
};

module.exports = {
  authenticate,
  authorize
};
