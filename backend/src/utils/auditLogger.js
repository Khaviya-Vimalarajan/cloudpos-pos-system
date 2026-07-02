const AuditLog = require('../models/AuditLog');

const logAudit = async (req, action, details) => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    await AuditLog.create({
      businessId: req.businessId || null,
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action,
      details,
      ipAddress: ip
    });
  } catch (error) {
    console.error('[Audit Log Failure]:', error);
  }
};

module.exports = logAudit;
