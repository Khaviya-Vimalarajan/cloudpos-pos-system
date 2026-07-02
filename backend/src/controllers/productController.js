const Product = require('../models/Product');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const InventoryLog = require('../models/InventoryLog');
const logAudit = require('../utils/auditLogger');
const uploadToCloudinary = require('../utils/cloudinary');

// CATEGORY CONTROLLERS
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ businessId: req.businessId });
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const newCategory = new Category({
      businessId: req.businessId,
      name,
      description
    });
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Category.findOneAndDelete({ _id: id, businessId: req.businessId });
    // Detach deleted category from products
    await Product.updateMany({ category: id, businessId: req.businessId }, { category: null });
    res.json({ message: 'Category deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// BRAND CONTROLLERS
const getBrands = async (req, res, next) => {
  try {
    const brands = await Brand.find({ businessId: req.businessId });
    res.json(brands);
  } catch (error) {
    next(error);
  }
};

const createBrand = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const newBrand = new Brand({
      businessId: req.businessId,
      name,
      description
    });
    await newBrand.save();
    res.status(201).json(newBrand);
  } catch (error) {
    next(error);
  }
};

const deleteBrand = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Brand.findOneAndDelete({ _id: id, businessId: req.businessId });
    // Detach deleted brand from products
    await Product.updateMany({ brand: id, businessId: req.businessId }, { brand: null });
    res.json({ message: 'Brand deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// PRODUCT CONTROLLERS
const getProducts = async (req, res, next) => {
  try {
    const { search, category, brand, stockStatus, sort } = req.query;
    let query = { businessId: req.businessId, status: { $ne: 'archived' } };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) query.category = category;
    if (brand) query.brand = brand;
    
    if (stockStatus === 'low') {
      // Find products where stock is less than or equal to minStockAlert
      query.$expr = { $lte: ['$stock', '$minStockAlert'] };
    } else if (stockStatus === 'out') {
      query.stock = 0;
    }

    let sortOptions = { createdAt: -1 };
    if (sort === 'name_asc') sortOptions = { name: 1 };
    if (sort === 'name_desc') sortOptions = { name: -1 };
    if (sort === 'price_asc') sortOptions = { price: 1 };
    if (sort === 'price_desc') sortOptions = { price: -1 };
    if (sort === 'stock_asc') sortOptions = { stock: 1 };
    if (sort === 'stock_desc') sortOptions = { stock: -1 };

    const products = await Product.find(query)
      .populate('category')
      .populate('brand')
      .sort(sortOptions);

    res.json(products);
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, businessId: req.businessId })
      .populate('category')
      .populate('brand');
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const { name, sku, barcode, price, cost, stock, minStockAlert, category, brand, image, variants, description } = req.body;

    const generatedSku = sku || 'SKU-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    const generatedBarcode = barcode || 'BC-' + Math.floor(100000000000 + Math.random() * 900000000000).toString();

    // Check SKU/Barcode duplication
    const duplicate = await Product.findOne({
      businessId: req.businessId,
      $or: [{ sku: generatedSku }, { barcode: generatedBarcode }]
    });

    if (duplicate) {
      return res.status(400).json({ message: 'SKU or Barcode already exists in this store.' });
    }

    // Upload base64 image to Cloudinary
    const imageUrl = await uploadToCloudinary(image, 'products');

    const newProduct = new Product({
      businessId: req.businessId,
      name,
      sku: generatedSku,
      barcode: generatedBarcode,
      price,
      cost,
      stock,
      minStockAlert: minStockAlert || 5,
      category: category || null,
      brand: brand || null,
      image: imageUrl,
      variants: variants || [],
      description
    });

    await newProduct.save();

    // Audit Log product creation
    await logAudit(req, 'PRODUCT_CREATE', `Created product '${newProduct.name}' with SKU '${newProduct.sku}'`);

    // Log initial stock log
    if (stock > 0) {
      const log = new InventoryLog({
        businessId: req.businessId,
        productId: newProduct._id,
        type: 'StockIn',
        quantity: stock,
        beforeQuantity: 0,
        afterQuantity: stock,
        reason: 'Initial product stock creation',
        userId: req.user.id
      });
      await log.save();
    }

    res.status(201).json(newProduct);
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, sku, barcode, price, cost, stock, minStockAlert, category, brand, image, variants, description } = req.body;

    const product = await Product.findOne({ _id: id, businessId: req.businessId });
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Check SKU / Barcode duplicate if changed
    if (sku && sku !== product.sku) {
      const duplicateSku = await Product.findOne({ businessId: req.businessId, sku });
      if (duplicateSku) return res.status(400).json({ message: 'SKU already exists.' });
    }
    if (barcode && barcode !== product.barcode) {
      const duplicateBarcode = await Product.findOne({ businessId: req.businessId, barcode });
      if (duplicateBarcode) return res.status(400).json({ message: 'Barcode already exists.' });
    }

    // Upload base64 image to Cloudinary if changed
    let imageUrl = product.image;
    if (image && image !== product.image) {
      imageUrl = await uploadToCloudinary(image, 'products');
    }

    const oldStock = product.stock;

    product.name = name ?? product.name;
    product.sku = sku ?? product.sku;
    product.barcode = barcode ?? product.barcode;
    product.price = price ?? product.price;
    product.cost = cost ?? product.cost;
    product.stock = stock ?? product.stock;
    product.minStockAlert = minStockAlert ?? product.minStockAlert;
    product.category = category ?? product.category;
    product.brand = brand ?? product.brand;
    product.image = imageUrl;
    product.variants = variants ?? product.variants;
    product.description = description ?? product.description;

    await product.save();

    // Audit Log product update
    await logAudit(req, 'PRODUCT_UPDATE', `Updated product details for '${product.name}'`);

    // Create adjustment inventory log if stock changed manually
    if (stock !== undefined && stock !== oldStock) {
      const log = new InventoryLog({
        businessId: req.businessId,
        productId: product._id,
        type: 'Adjustment',
        quantity: stock - oldStock,
        beforeQuantity: oldStock,
        afterQuantity: stock,
        reason: 'Manual stock level adjustment',
        userId: req.user.id
      });
      await log.save();
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Archive product instead of hard deleting (maintains referential integrity for reporting)
    const product = await Product.findOneAndUpdate(
      { _id: id, businessId: req.businessId },
      { status: 'archived' },
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Audit Log product archiving
    await logAudit(req, 'PRODUCT_DELETE', `Archived product '${product.name}'`);

    res.json({ message: 'Product deleted/archived successfully.' });
  } catch (error) {
    next(error);
  }
};

// CSV EXPORT
const exportProductsCSV = async (req, res, next) => {
  try {
    const products = await Product.find({ businessId: req.businessId, status: { $ne: 'archived' } });
    
    const headers = ['Name', 'SKU', 'Barcode', 'Price', 'Cost', 'Stock', 'MinStockAlert', 'Description'];
    const rows = products.map(p => [
      p.name, p.sku, p.barcode, p.price, p.cost, p.stock, p.minStockAlert, p.description || ''
    ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(','));
    
    const csvContent = [headers.join(','), ...rows].join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=products.csv');
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

// CSV IMPORT
const importProductsCSV = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a CSV file.' });
    }

    const csvText = req.file.buffer.toString('utf-8');
    const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length <= 1) {
      return res.status(400).json({ message: 'CSV file is empty.' });
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    let importedCount = 0;
    let errorCount = 0;

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      if (values.length < headers.length) continue;

      const entry = {};
      headers.forEach((h, idx) => {
        entry[h] = values[idx];
      });

      // Map values
      const name = entry['Name'] || entry['name'];
      const price = parseFloat(entry['Price'] || entry['price'] || 0);
      const cost = parseFloat(entry['Cost'] || entry['cost'] || 0);
      const stock = parseInt(entry['Stock'] || entry['stock'] || 0);
      const minStockAlert = parseInt(entry['MinStockAlert'] || entry['minStockAlert'] || 5);
      const description = entry['Description'] || entry['description'] || '';

      if (!name) {
        errorCount++;
        continue;
      }

      const generatedSku = entry['SKU'] || entry['sku'] || 'SKU-' + Math.random().toString(36).substring(2, 9).toUpperCase();
      const generatedBarcode = entry['Barcode'] || entry['barcode'] || 'BC-' + Math.floor(100000000000 + Math.random() * 900000000000).toString();

      // Check if SKU/Barcode already exists
      const duplicate = await Product.findOne({
        businessId: req.businessId,
        $or: [{ sku: generatedSku }, { barcode: generatedBarcode }]
      });

      if (duplicate) {
        errorCount++;
        continue;
      }

      const newProduct = new Product({
        businessId: req.businessId,
        name,
        sku: generatedSku,
        barcode: generatedBarcode,
        price,
        cost,
        stock,
        minStockAlert,
        description
      });
      await newProduct.save();

      // Log stock log
      if (stock > 0) {
        const log = new InventoryLog({
          businessId: req.businessId,
          productId: newProduct._id,
          type: 'StockIn',
          quantity: stock,
          beforeQuantity: 0,
          afterQuantity: stock,
          reason: 'CSV product import creation',
          userId: req.user.id
        });
        await log.save();
      }

      importedCount++;
    }

    res.json({
      message: `CSV Import complete. Successfully imported: ${importedCount}. Failed/Duplicates: ${errorCount}.`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  createCategory,
  deleteCategory,
  getBrands,
  createBrand,
  deleteBrand,
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  exportProductsCSV,
  importProductsCSV
};
