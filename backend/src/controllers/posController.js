const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const InventoryLog = require('../models/InventoryLog');
const logAudit = require('../utils/auditLogger');

// Generate invoice number, e.g. INV-20260626-0001
const generateInvoiceNumber = async (businessId) => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `INV-${dateStr}-`;
  
  // Count how many orders exist for this business today
  const startOfDay = new Date();
  startOfDay.setHours(0,0,0,0);
  const endOfDay = new Date();
  endOfDay.setHours(23,59,59,999);

  const count = await Order.countDocuments({
    businessId,
    createdAt: { $gte: startOfDay, $lte: endOfDay }
  });

  const nextNum = String(count + 1).padStart(4, '0');
  return `${prefix}${nextNum}`;
};

// Checkout Order
const checkout = async (req, res, next) => {
  try {
    const { items, customerId, storeId, discountAmount, taxAmount, paymentMethod, payments, notes } = req.body;

    const invoiceNumber = await generateInvoiceNumber(req.businessId);
    let subTotal = 0;
    let totalCost = 0;
    const checkoutItems = [];

    // Verify stock & calculate totals
    for (const item of items) {
      const product = await Product.findOne({ _id: item.productId, businessId: req.businessId });
      if (!product) {
        return res.status(404).json({ message: `Product with ID ${item.productId} not found.` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for product '${product.name}'. Available: ${product.stock}, Requested: ${item.quantity}.` 
        });
      }

      const itemPrice = product.price;
      const itemCost = product.cost;
      const itemDiscount = item.discount || 0;
      const itemTax = item.tax || 0;

      const itemTotal = (itemPrice - itemDiscount + itemTax) * item.quantity;
      subTotal += itemPrice * item.quantity;
      totalCost += itemCost * item.quantity;

      checkoutItems.push({
        productId: product._id,
        name: product.name,
        sku: product.sku,
        price: itemPrice,
        cost: itemCost,
        quantity: item.quantity,
        discount: itemDiscount,
        tax: itemTax,
        total: itemTotal
      });

      // Deduct Stock
      const oldStock = product.stock;
      product.stock -= item.quantity;
      await product.save();

      // Log Stock Deduction
      const log = new InventoryLog({
        businessId: req.businessId,
        productId: product._id,
        storeId: storeId || null,
        type: 'Sale',
        quantity: -item.quantity,
        beforeQuantity: oldStock,
        afterQuantity: product.stock,
        reason: `Sold via Invoice ${invoiceNumber}`,
        userId: req.user.id
      });
      await log.save();
    }

    const calculatedDiscount = discountAmount || 0;
    const calculatedTax = taxAmount || 0;
    const totalAmount = subTotal - calculatedDiscount + calculatedTax;
    const profit = totalAmount - totalCost;

    // Create Order
    const newOrder = new Order({
      businessId: req.businessId,
      storeId: storeId || null,
      cashierId: req.user.id,
      customerId: customerId || null,
      invoiceNumber,
      items: checkoutItems,
      subTotal,
      discountAmount: calculatedDiscount,
      taxAmount: calculatedTax,
      totalAmount,
      totalCost,
      profit,
      paymentMethod,
      payments: payments || [{ method: paymentMethod, amount: totalAmount }],
      notes
    });

    await newOrder.save();

    // Loyalty Points (e.g. 1 point for every $10 spent)
    if (customerId) {
      const pointsEarned = Math.floor(totalAmount / 10);
      if (pointsEarned > 0) {
        await Customer.findByIdAndUpdate(customerId, {
          $inc: { loyaltyPoints: pointsEarned }
        });
      }
    }

    const populatedOrder = await Order.findById(newOrder._id)
      .populate('cashierId', 'name')
      .populate('customerId', 'name phone loyaltyPoints');

    // Audit Log
    await logAudit(req, 'SALE_CHECKOUT', `Completed checkout for Invoice ${invoiceNumber}. Total: $${totalAmount.toFixed(2)}`);

    res.status(201).json(populatedOrder);
  } catch (error) {
    next(error);
  }
};

// Retrieve Sales History
const getOrders = async (req, res, next) => {
  try {
    const { cashierId, customerId, paymentMethod, paymentStatus, invoiceNumber } = req.query;
    let query = { businessId: req.businessId };

    if (cashierId) query.cashierId = cashierId;
    if (customerId) query.customerId = customerId;
    if (paymentMethod) query.paymentMethod = paymentMethod;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (invoiceNumber) query.invoiceNumber = { $regex: invoiceNumber, $options: 'i' };

    const orders = await Order.find(query)
      .populate('cashierId', 'name')
      .populate('customerId', 'name')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkout,
  getOrders
};
