const User = require('../models/User');
const Business = require('../models/Business');
const jwt = require('jsonwebtoken');
const { generateAccessToken, generateRefreshToken } = require('../utils/token');
const logAudit = require('../utils/auditLogger');
const uploadToCloudinary = require('../utils/cloudinary');

// Register Business & Business Owner
const registerBusiness = async (req, res, next) => {
  try {
    const { businessName, ownerName, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    // Create Business
    const newBusiness = new Business({
      name: businessName,
      status: 'active', // default active
    });
    const savedBusiness = await newBusiness.save();

    // Create Owner User
    const newUser = new User({
      name: ownerName,
      email,
      password,
      role: 'BusinessOwner',
      businessId: savedBusiness._id,
      status: 'active'
    });
    const savedUser = await newUser.save();

    // Generate tokens
    const accessToken = generateAccessToken(savedUser);
    const refreshToken = generateRefreshToken(savedUser);

    // Save refresh token
    savedUser.refreshToken = refreshToken;
    await savedUser.save();

    res.status(201).json({
      message: 'Business registered successfully.',
      accessToken,
      refreshToken,
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
        businessId: savedUser.businessId
      },
      business: savedBusiness
    });
  } catch (error) {
    next(error);
  }
};

// User Login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate('businessId');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ message: 'Your account is inactive.' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Verify tenant is active
    if (user.role !== 'SuperAdmin' && user.businessId) {
      if (user.businessId.status === 'suspended') {
        return res.status(403).json({ message: 'Your business account is suspended. Contact support.' });
      }
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage || null,
        businessId: user.businessId ? user.businessId._id : null
      },
      business: user.role !== 'SuperAdmin' ? user.businessId : null
    });
  } catch (error) {
    next(error);
  }
};

// Token Refresh
const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required.' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'cp_refresh_secret_11223344##$$');
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken || user.status !== 'active') {
      return res.status(401).json({ message: 'Invalid refresh token.' });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    user.refreshToken = newRefreshToken;
    await user.save();

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token.' });
  }
};

// Logout User
const logout = async (req, res, next) => {
  try {
    const { id } = req.user;
    await User.findByIdAndUpdate(id, { refreshToken: null });
    res.json({ message: 'Logged out successfully.' });
  } catch (error) {
    next(error);
  }
};

// Simulated Forgot Password
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No user registered with this email.' });
    }
    // Simulate email dispatch
    res.json({ message: 'Password reset link sent to your email.' });
  } catch (error) {
    next(error);
  }
};

// Simulated Reset Password
const resetPassword = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password reset successful.' });
  } catch (error) {
    next(error);
  }
};

// Update User Profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, profileImage } = req.body;
    const userId = req.user.id;

    // Upload base64 image to Cloudinary if updated
    let imageUrl = profileImage;
    if (profileImage && profileImage.startsWith('data:image')) {
      imageUrl = await uploadToCloudinary(profileImage, 'profiles');
    }

    const updatedFields = {};
    if (name) updatedFields.name = name;
    if (profileImage !== undefined) updatedFields.profileImage = imageUrl;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updatedFields },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Audit Log
    await logAudit(req, 'PROFILE_UPDATE', `Updated user name to '${user.name}'`);

    res.json({
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        businessId: user.businessId
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerBusiness,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  updateProfile
};
