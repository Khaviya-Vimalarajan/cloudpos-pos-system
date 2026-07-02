const Business = require('../models/Business');
const User = require('../models/User');
const Order = require('../models/Order');
const AuditLog = require('../models/AuditLog');

const getTenants = async (req, res, next) => {
  try {
    const tenants = await Business.find().sort({ createdAt: -1 });
    
    // Enrich with owner email and users count
    const enrichedTenants = [];
    for (const tenant of tenants) {
      const owner = await User.findOne({ businessId: tenant._id, role: 'BusinessOwner' });
      const usersCount = await User.countDocuments({ businessId: tenant._id });
      const ordersCount = await Order.countDocuments({ businessId: tenant._id });
      
      enrichedTenants.push({
        ...tenant.toObject(),
        ownerEmail: owner ? owner.email : 'N/A',
        ownerName: owner ? owner.name : 'N/A',
        usersCount,
        ordersCount
      });
    }

    res.json(enrichedTenants);
  } catch (error) {
    next(error);
  }
};

const updateTenantStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'suspended', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid business status.' });
    }

    const business = await Business.findByIdAndUpdate(id, { status }, { new: true });
    if (!business) {
      return res.status(404).json({ message: 'Business tenant not found.' });
    }

    res.json({
      message: `Business status successfully updated to '${status}'.`,
      business
    });
  } catch (error) {
    next(error);
  }
};

const getPlatformMetrics = async (req, res, next) => {
  try {
    const businessesCount = await Business.countDocuments();
    const usersCount = await User.countDocuments();
    
    // Calculate total platform transaction volume
    const salesVolume = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' }, profit: { $sum: '$profit' } } }
    ]);

    // Group business subscriptions
    const subBreakdown = await Business.aggregate([
      { $group: { _id: '$subscriptionPlan', count: { $sum: 1 } } }
    ]);

    res.json({
      metrics: {
        totalBusinesses: businessesCount,
        totalUsers: usersCount,
        totalSalesVolume: salesVolume[0]?.total || 0,
        totalPlatformProfit: salesVolume[0]?.profit || 0
      },
      subscriptions: subBreakdown
    });
  } catch (error) {
    next(error);
  }
};

const getSystemLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100);
    res.json(logs);
  } catch (error) {
    next(error);
  }
};

const getAdminNotifications = async (req, res, next) => {
  try {
    const recentBusinesses = await Business.find().sort({ createdAt: -1 }).limit(10);
    const notifications = recentBusinesses.map(bus => ({
      id: bus._id,
      type: 'NewBusiness',
      message: `New Business: '${bus.name}' registered successfully. Status: ${bus.status}`,
      createdAt: bus.createdAt
    }));
    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTenants,
  updateTenantStatus,
  getPlatformMetrics,
  getSystemLogs,
  getAdminNotifications
};
