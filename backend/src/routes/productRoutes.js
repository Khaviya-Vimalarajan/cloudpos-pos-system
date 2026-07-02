const express = require('express');
const router = express.Router();
const multer = require('multer');
const { 
  getCategories, createCategory, deleteCategory,
  getBrands, createBrand, deleteBrand,
  getProducts, getProductById, createProduct, updateProduct, deleteProduct,
  exportProductsCSV, importProductsCSV
} = require('../controllers/productController');
const { authenticate, authorize } = require('../middleware/auth');
const { productValidation } = require('../middleware/validator');

const upload = multer({ storage: multer.memoryStorage() });

// Categories
router.route('/categories')
  .get(authenticate, getCategories)
  .post(authenticate, authorize('BusinessOwner', 'InventoryManager'), createCategory);
router.delete('/categories/:id', authenticate, authorize('BusinessOwner'), deleteCategory);

// Brands
router.route('/brands')
  .get(authenticate, getBrands)
  .post(authenticate, authorize('BusinessOwner', 'InventoryManager'), createBrand);
router.delete('/brands/:id', authenticate, authorize('BusinessOwner'), deleteBrand);

// Bulk CSV Operations
router.get('/export', authenticate, exportProductsCSV);
router.post('/import', authenticate, authorize('BusinessOwner', 'InventoryManager'), upload.single('file'), importProductsCSV);

// Standard Product CRUD
router.route('/')
  .get(authenticate, getProducts)
  .post(authenticate, authorize('BusinessOwner', 'InventoryManager'), productValidation, createProduct);

router.route('/:id')
  .get(authenticate, getProductById)
  .put(authenticate, authorize('BusinessOwner', 'InventoryManager'), productValidation, updateProduct)
  .delete(authenticate, authorize('BusinessOwner'), deleteProduct);

module.exports = router;
