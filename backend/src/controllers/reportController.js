const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Expense = require('../models/Expense');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const Business = require('../models/Business');
const mongoose = require('mongoose');
const logAudit = require('../utils/auditLogger');

// GET DASHBOARD OVERVIEW METRICS
const getDashboardOverview = async (req, res, next) => {
  try {
    const businessId = req.businessId;

    // Time ranges
    const today = new Date();
    today.setHours(0,0,0,0);
    const endOfToday = new Date();
    endOfToday.setHours(23,59,59,999);

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);
    startOfWeek.setHours(0,0,0,0);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0,0,0,0);

    // Today's Sales
    const todaySales = await Order.aggregate([
      { $match: { businessId, createdAt: { $gte: today, $lte: endOfToday } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' }, profit: { $sum: '$profit' }, count: { $sum: 1 } } }
    ]);

    // Weekly Sales
    const weeklySales = await Order.aggregate([
      { $match: { businessId, createdAt: { $gte: startOfWeek } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    // Monthly Sales
    const monthlySales = await Order.aggregate([
      { $match: { businessId, createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' }, profit: { $sum: '$profit' } } }
    ]);

    // Inventory status
    const productStats = await Product.aggregate([
      { $match: { businessId, status: { $ne: 'archived' } } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          inventoryValue: { $sum: { $multiply: ['$stock', '$price'] } },
          inventoryCost: { $sum: { $multiply: ['$stock', '$cost'] } },
          lowStockCount: {
            $sum: {
              $cond: [{ $lte: ['$stock', '$minStockAlert'] }, 1, 0]
            }
          }
        }
      }
    ]);

    // Customer Count
    const customerCount = await Customer.countDocuments({ businessId });

    // Expenses this month
    const monthlyExpenses = await Expense.aggregate([
      { $match: { businessId, date: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Recent Orders (last 5)
    const recentOrders = await Order.find({ businessId })
      .populate('cashierId', 'name')
      .populate('customerId', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Top Selling Products
    const topSellingProducts = await Order.aggregate([
      { $match: { businessId } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          name: { $first: '$items.name' },
          sku: { $first: '$items.sku' },
          quantity: { $sum: '$items.quantity' },
          revenue: { $sum: '$items.total' }
        }
      },
      { $sort: { quantity: -1 } },
      { $limit: 5 }
    ]);

    // Chart Data: Daily Sales last 15 days
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
    fifteenDaysAgo.setHours(0,0,0,0);
    const salesChartData = await Order.aggregate([
      { $match: { businessId, createdAt: { $gte: fifteenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          sales: { $sum: '$totalAmount' },
          profit: { $sum: '$profit' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      metrics: {
        todaySales: todaySales[0]?.total || 0,
        todayProfit: todaySales[0]?.profit || 0,
        todayCount: todaySales[0]?.count || 0,
        weeklySales: weeklySales[0]?.total || 0,
        monthlySales: monthlySales[0]?.total || 0,
        monthlyProfit: monthlySales[0]?.profit || 0,
        monthlyExpenses: monthlyExpenses[0]?.total || 0,
        totalCustomers: customerCount,
        totalProducts: productStats[0]?.totalProducts || 0,
        inventoryValue: productStats[0]?.inventoryValue || 0,
        inventoryCost: productStats[0]?.inventoryCost || 0,
        lowStockCount: productStats[0]?.lowStockCount || 0
      },
      recentOrders,
      topSellingProducts,
      salesChartData
    });
  } catch (error) {
    next(error);
  }
};

// EXPORT INVOICE PDF
const downloadInvoicePDF = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ _id: orderId, businessId: req.businessId })
      .populate('cashierId', 'name')
      .populate('customerId', 'name phone address');

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    let PDFDocument;
    try {
      PDFDocument = require('pdfkit');
    } catch (e) {
      return res.status(500).json({ message: 'PDF Kit library is not installed.' });
    }

    const doc = new PDFDocument({ margin: 40, size: 'A6' }); // POS Receipt size
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Receipt-${order.invoiceNumber}.pdf`);
    doc.pipe(res);

    // Business details & Header
    doc.fontSize(16).text('CloudPOS Store', { align: 'center', bold: true });
    doc.fontSize(8).text('Multi-Tenant Retail Point of Sale', { align: 'center' });
    doc.moveDown();
    
    doc.text(`Invoice: ${order.invoiceNumber}`);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`);
    doc.text(`Cashier: ${order.cashierId?.name || 'Staff'}`);
    if (order.customerId) {
      doc.text(`Customer: ${order.customerId.name} (${order.customerId.phone})`);
    }
    doc.moveDown();

    // Divider
    doc.moveTo(40, doc.y).lineTo(doc.page.width - 40, doc.y).stroke();
    doc.moveDown();

    // Table header
    doc.fontSize(9).text('Item Description', { bold: true });
    doc.text('Qty x Price', { align: 'right' });
    doc.moveDown(0.5);

    // List items
    order.items.forEach(item => {
      doc.fontSize(8).text(`${item.name}`);
      doc.text(`${item.quantity} x $${item.price.toFixed(2)}    $${item.total.toFixed(2)}`, { align: 'right' });
      doc.moveDown(0.3);
    });

    doc.moveDown();
    doc.moveTo(40, doc.y).lineTo(doc.page.width - 40, doc.y).stroke();
    doc.moveDown();

    // Totals
    doc.fontSize(9);
    doc.text(`Subtotal: $${order.subTotal.toFixed(2)}`, { align: 'right' });
    if (order.discountAmount > 0) {
      doc.text(`Discount: -$${order.discountAmount.toFixed(2)}`, { align: 'right' });
    }
    if (order.taxAmount > 0) {
      doc.text(`Tax: $${order.taxAmount.toFixed(2)}`, { align: 'right' });
    }
    doc.fontSize(11).text(`Total: $${order.totalAmount.toFixed(2)}`, { align: 'right', bold: true });
    doc.fontSize(8).text(`Payment: ${order.paymentMethod}`, { align: 'left' });

    doc.moveDown(2);
    doc.fontSize(8).text('Thank you for shopping with us!', { align: 'center', oblique: true });

    doc.end();
  } catch (error) {
    next(error);
  }
};

const getActivityLogs = async (req, res, next) => {
  try {
    const businessId = req.businessId;
    const logs = await AuditLog.find({ businessId })
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(logs);
  } catch (error) {
    next(error);
  }
};

const getBusinessDetails = async (req, res, next) => {
  try {
    const business = await Business.findById(req.businessId);
    if (!business) {
      return res.status(404).json({ message: 'Business not found.' });
    }
    res.json(business);
  } catch (error) {
    next(error);
  }
};

const updateBusinessDetails = async (req, res, next) => {
  try {
    const { name, currency, timeZone, address, taxSettings, subscriptionPlan } = req.body;
    const business = await Business.findById(req.businessId);
    if (!business) {
      return res.status(404).json({ message: 'Business not found.' });
    }

    if (name) business.name = name;
    if (currency) business.currency = currency;
    if (timeZone) business.timeZone = timeZone;
    if (address) business.address = address;
    if (taxSettings) business.taxSettings = taxSettings;
    if (subscriptionPlan) business.subscriptionPlan = subscriptionPlan;

    await business.save();

    // Audit Log settings update
    await logAudit(req, 'SETTINGS_UPDATE', `Updated business profile settings for '${business.name}'`);

    res.json({ message: 'Business configuration updated successfully.', business });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardOverview,
  downloadInvoicePDF,
  getActivityLogs,
  getBusinessDetails,
  updateBusinessDetails
};
