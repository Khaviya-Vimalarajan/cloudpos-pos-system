const Business = require('../models/Business');
const User = require('../models/User');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const Supplier = require('../models/Supplier');
const Product = require('../models/Product');

/**
 * Seeds the database with default Sri Lankan business data.
 * If a business already exists in the system, it seeds the mock data under the first business found.
 * If no business exists, it creates a default business and owner first.
 */
const runSeeder = async () => {
  try {
    let business = await Business.findOne();
    let owner = null;

    // If no business exists, create a default business & owner
    if (!business) {
      business = new Business({
        name: 'Sri Lanka General Retailers',
        currency: 'LKR',
        subscriptionPlan: 'Free',
        status: 'active',
        taxSettings: {
          rate: 15,
          type: 'VAT',
          inclusive: false
        },
        address: {
          street: '100 Galle Road',
          city: 'Colombo',
          state: 'Western Province',
          zip: '00300',
          country: 'Sri Lanka'
        },
        timeZone: 'Asia/Colombo'
      });
      await business.save();

      owner = new User({
        name: 'Default Business Owner',
        email: 'owner@cloudpos.com',
        password: 'password123', // Will be automatically hashed by User pre-save hook
        role: 'BusinessOwner',
        businessId: business._id,
        status: 'active'
      });
      await owner.save();
    }

    const businessId = business._id;

    // 1. Clear existing mock data under this business to prevent duplicates
    await Promise.all([
      Category.deleteMany({ businessId }),
      Brand.deleteMany({ businessId }),
      Supplier.deleteMany({ businessId }),
      Product.deleteMany({ businessId })
    ]);

    // 2. Seed Categories
    const categoriesData = [
      { name: 'Beverages', description: 'Teas, soft drinks, juices, and water' },
      { name: 'Snacks & Biscuits', description: 'Sweet and savory local snacks' },
      { name: 'Grocery Essentials', description: 'Rice, spices, flour, and household cooking needs' },
      { name: 'Dairy Products', description: 'Milk, cheese, butter, and yogurts' }
    ].map(cat => ({ ...cat, businessId }));
    const seededCategories = await Category.insertMany(categoriesData);

    // Create a lookup map for categories
    const categoryMap = {};
    seededCategories.forEach(cat => {
      categoryMap[cat.name] = cat._id;
    });

    // 3. Seed Brands
    const brandsData = [
      { name: 'Dilmah', description: 'Premium Ceylon Tea' },
      { name: 'Elephant House', description: 'Traditional Sri Lankan carbonated beverages' },
      { name: 'Munchee', description: 'Leading local biscuit manufacturer' },
      { name: 'Highland', description: 'Pure Sri Lankan dairy products' }
    ].map(brand => ({ ...brand, businessId }));
    const seededBrands = await Brand.insertMany(brandsData);

    // Create a lookup map for brands
    const brandMap = {};
    seededBrands.forEach(brand => {
      brandMap[brand.name] = brand._id;
    });

    // 4. Seed Suppliers
    const suppliersData = [
      {
        name: 'Ceylon Tea Distributors',
        contactName: 'Mr. Rohan Perera',
        email: 'rohan@ceylonteadist.lk',
        phone: '+94 77 123 4567',
        address: '50 Braybrooke Place, Colombo 02',
        businessId
      },
      {
        name: 'Elephant House Beverages Ltd',
        contactName: 'Mrs. Sanduni Jayasinghe',
        email: 'sanduni@elephanthouse.lk',
        phone: '+94 11 234 5678',
        address: '148 Vauxhall Street, Colombo 02',
        businessId
      },
      {
        name: 'Highland Dairy Co-operative',
        contactName: 'Mr. Nihal Fernando',
        email: 'nihal@highland.lk',
        phone: '+94 71 987 6543',
        address: '320 Nuwara Eliya Road, Nuwara Eliya',
        businessId
      }
    ];
    await Supplier.insertMany(suppliersData);

    // 5. Seed Products
    const productsData = [
      {
        businessId,
        name: 'Dilmah Premium Ceylon Tea (100 Bags)',
        sku: 'TEA-DIL-100B',
        barcode: '4792252000234',
        price: 950.00,
        cost: 650.00,
        stock: 120,
        minStockAlert: 15,
        category: categoryMap['Beverages'],
        brand: brandMap['Dilmah'],
        description: 'Single-origin 100% pure Ceylon black tea packaged in tea bags.',
        status: 'active'
      },
      {
        businessId,
        name: 'Elephant House Ginger Beer (330ml Can)',
        sku: 'BEV-EHB-G330',
        barcode: '4792012010152',
        price: 180.00,
        cost: 130.00,
        stock: 350,
        minStockAlert: 50,
        category: categoryMap['Beverages'],
        brand: brandMap['Elephant House'],
        description: 'Authentic Sri Lankan ginger beer made with natural ginger extracts.',
        status: 'active'
      },
      {
        businessId,
        name: 'Munchee Lemon Puff (200g)',
        sku: 'SNA-MUN-L200',
        barcode: '4792033005236',
        price: 240.00,
        cost: 180.00,
        stock: 180,
        minStockAlert: 20,
        category: categoryMap['Snacks & Biscuits'],
        brand: brandMap['Munchee'],
        description: 'Delicious lemon cream sandwiched between crispy puff biscuits.',
        status: 'active'
      },
      {
        businessId,
        name: 'Highland Full Cream Milk Powder (400g)',
        sku: 'DY-HLD-FC400',
        barcode: '4792015030225',
        price: 1050.00,
        cost: 850.00,
        stock: 80,
        minStockAlert: 10,
        category: categoryMap['Dairy Products'],
        brand: brandMap['Highland'],
        description: '100% pure instant full cream milk powder manufactured in Nuwara Eliya.',
        status: 'active'
      }
    ];

    await Product.insertMany(productsData);

    console.log('[Seeder successfully seeded database with mock Sri Lankan defaults]');
  } catch (error) {
    console.error('[Seeder Failure]:', error);
    throw error;
  }
};

module.exports = runSeeder;
