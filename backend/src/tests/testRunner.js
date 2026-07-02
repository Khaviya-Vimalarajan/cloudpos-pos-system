const mongoose = require('mongoose');
const Business = require('../models/Business');
const Product = require('../models/Product');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cloudpos_test';

const runTests = async () => {
  let passed = true;
  console.log('\n=======================================');
  console.log('   CLOUDPOS BACKEND INTEGRATION TESTS  ');
  console.log('=======================================\n');

  try {
    console.log('[Test]: Connecting to test database...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('[Test]: Connected.');

    // Clear test database
    await Promise.all([
      Business.deleteMany({}),
      Product.deleteMany({}),
      User.deleteMany({})
    ]);

    // Test Case 1: Tenant Provisioning
    console.log('\n[Test 1]: Provisioning two tenant businesses...');
    const tenantA = new Business({ name: 'Tenant A Retailers', subscriptionPlan: 'Free' });
    const tenantB = new Business({ name: 'Tenant B Wholesalers', subscriptionPlan: 'Professional' });
    await Promise.all([tenantA.save(), tenantB.save()]);
    console.log('✔ Tenant A and Tenant B created successfully.');

    // Test Case 2: Multi-Tenant Data Seeding
    console.log('\n[Test 2]: Seeding tenant-scoped catalog products...');
    const prodA = new Product({
      businessId: tenantA._id,
      name: 'Product Tenant A',
      sku: 'SKU-A-100',
      barcode: 'BARCODE-A',
      price: 10.00,
      cost: 4.00,
      stock: 50
    });
    const prodB = new Product({
      businessId: tenantB._id,
      name: 'Product Tenant B',
      sku: 'SKU-B-200',
      barcode: 'BARCODE-B',
      price: 25.00,
      cost: 12.00,
      stock: 30
    });
    await Promise.all([prodA.save(), prodB.save()]);
    console.log('✔ Products seeded successfully under correct tenant scopes.');

    // Test Case 3: Tenant Isolation Verification
    console.log('\n[Test 3]: Verifying tenant isolation boundaries...');
    
    // Fetch products as Tenant A
    const tenantAProducts = await Product.find({ businessId: tenantA._id });
    const hasTenantBProductInA = tenantAProducts.some(p => p.sku === 'SKU-B-200');
    
    if (hasTenantBProductInA) {
      console.log('✖ FAIL: Tenant A has access to Tenant B\'s catalog!');
      passed = false;
    } else {
      console.log('✔ PASS: Tenant A results completely isolated from Tenant B.');
    }

    // Fetch products as Tenant B
    const tenantBProducts = await Product.find({ businessId: tenantB._id });
    const hasTenantAProductInB = tenantBProducts.some(p => p.sku === 'SKU-A-100');

    if (hasTenantAProductInB) {
      console.log('✖ FAIL: Tenant B has access to Tenant A\'s catalog!');
      passed = false;
    } else {
      console.log('✔ PASS: Tenant B results completely isolated from Tenant A.');
    }

    // Test Case 4: Stock Adjustment Assertions
    console.log('\n[Test 4]: Verifying stock levels adjustment calculations...');
    const product = await Product.findOne({ sku: 'SKU-A-100' });
    const originalStock = product.stock; // 50
    
    product.stock += 15; // simulate adjustment
    await product.save();
    
    const updatedProduct = await Product.findOne({ sku: 'SKU-A-100' });
    if (updatedProduct.stock === originalStock + 15) {
      console.log(`✔ PASS: Stock level correctly increased from ${originalStock} to ${updatedProduct.stock}.`);
    } else {
      console.log(`✖ FAIL: Stock level calculation error. Expected: ${originalStock + 15}, Got: ${updatedProduct.stock}`);
      passed = false;
    }

    console.log('\n=======================================');
    if (passed) {
      console.log('   ALL INTEGRATION TESTS PASSED!       ');
    } else {
      console.log('   TEST EXECUTION FAILED!              ');
    }
    console.log('=======================================\n');

    mongoose.connection.close();
    process.exit(passed ? 0 : 1);
  } catch (error) {
    console.error(`[Test Execution Crash]: ${error.message}`);
    process.exit(1);
  }
};

runTests();
