const Product = require('../models/Product');
const Store = require('../models/Store');
const InventoryLog = require('../models/InventoryLog');

// BRANCHES & WAREHOUSES CRUD
const getStores = async (req, res, next) => {
  try {
    const stores = await Store.find({ businessId: req.businessId });
    res.json(stores);
  } catch (error) {
    next(error);
  }
};

const createStore = async (req, res, next) => {
  try {
    const { name, address, phone, type } = req.body;
    const newStore = new Store({
      businessId: req.businessId,
      name,
      address,
      phone,
      type
    });
    await newStore.save();
    res.status(201).json(newStore);
  } catch (error) {
    next(error);
  }
};

// STOCK LEVEL ADJUSTMENTS
const adjustStock = async (req, res, next) => {
  try {
    const { productId, adjustmentQty, reason, storeId } = req.body;

    const product = await Product.findOne({ _id: productId, businessId: req.businessId });
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const oldStock = product.stock;
    const newStock = oldStock + adjustmentQty;
    if (newStock < 0) {
      return res.status(400).json({ message: 'Adjusted stock cannot fall below 0.' });
    }

    product.stock = newStock;
    await product.save();

    // Log adjustment
    const log = new InventoryLog({
      businessId: req.businessId,
      productId: product._id,
      storeId: storeId || null,
      type: 'Adjustment',
      quantity: adjustmentQty,
      beforeQuantity: oldStock,
      afterQuantity: newStock,
      reason: reason || 'Manual inventory adjustment',
      userId: req.user.id
    });
    await log.save();

    res.json({
      message: 'Stock adjusted successfully.',
      product
    });
  } catch (error) {
    next(error);
  }
};

// STOCK TRANSFERS BETWEEN BRANCHES
const transferStock = async (req, res, next) => {
  try {
    const { productId, quantity, fromStoreId, toStoreId } = req.body;

    const product = await Product.findOne({ _id: productId, businessId: req.businessId });
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock to transfer.' });
    }

    const fromStore = await Store.findById(fromStoreId);
    const toStore = await Store.findById(toStoreId);

    if (!fromStore || !toStore) {
      return res.status(404).json({ message: 'Source or destination store not found.' });
    }

    // In a multi-location model, we'd adjust stock per location. In our simplified model, we deduction-log it
    // and record logs to represent the branch transfer history. Let's record the transfer logs.
    const logFrom = new InventoryLog({
      businessId: req.businessId,
      productId: product._id,
      storeId: fromStoreId,
      type: 'Transfer',
      quantity: -quantity,
      beforeQuantity: product.stock,
      afterQuantity: product.stock - quantity,
      reason: `Transfer OUT to ${toStore.name}`,
      userId: req.user.id
    });
    await logFrom.save();

    const logTo = new InventoryLog({
      businessId: req.businessId,
      productId: product._id,
      storeId: toStoreId,
      type: 'Transfer',
      quantity: quantity,
      beforeQuantity: product.stock, // simulated log
      afterQuantity: product.stock,
      reason: `Transfer IN from ${fromStore.name}`,
      userId: req.user.id
    });
    await logTo.save();

    res.json({
      message: `Successfully registered transfer of ${quantity} units from ${fromStore.name} to ${toStore.name}.`
    });
  } catch (error) {
    next(error);
  }
};

// LOW STOCK ALERT LIST
const getLowStockAlerts = async (req, res, next) => {
  try {
    // Find products where stock is <= minStockAlert
    const lowStockProducts = await Product.find({
      businessId: req.businessId,
      status: { $ne: 'archived' },
      $expr: { $lte: ['$stock', '$minStockAlert'] }
    }).populate('category');

    res.json(lowStockProducts);
  } catch (error) {
    next(error);
  }
};

// INVENTORY AUDIT LOGS
const getInventoryLogs = async (req, res, next) => {
  try {
    const logs = await InventoryLog.find({ businessId: req.businessId })
      .populate('productId', 'name sku barcode')
      .populate('userId', 'name')
      .populate('storeId', 'name')
      .sort({ createdAt: -1 });

    res.json(logs);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStores,
  createStore,
  adjustStock,
  transferStock,
  getLowStockAlerts,
  getInventoryLogs
};
