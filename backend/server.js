const path = require('path');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');

// Route Imports
const authRoutes = require('./src/routes/authRoutes');
const productRoutes = require('./src/routes/productRoutes');
const inventoryRoutes = require('./src/routes/inventoryRoutes');
const posRoutes = require('./src/routes/posRoutes');
const customerRoutes = require('./src/routes/customerRoutes');
const supplierRoutes = require('./src/routes/supplierRoutes');
const expenseRoutes = require('./src/routes/expenseRoutes');
const employeeRoutes = require('./src/routes/employeeRoutes');
const reportRoutes = require('./src/routes/reportRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

const app = express();

// Connect to Database
connectDB();

// Global Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Rate Limiting (e.g. max 10000 requests per 15 minutes from one IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000,
  message: { message: 'Too many requests from this IP, please try again later.' }
});
app.use('/api', limiter);

// Register Feature API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/pos', posRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);

// Database auto-seeder route
app.get('/api/seed', async (req, res, next) => {
  try {
    const runSeeder = require('./src/utils/seederFunc');
    await runSeeder();
    res.json({ message: 'Database successfully seeded with Sri Lankan defaults!' });
  } catch (err) {
    next(err);
  }
});

// Base route test
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to CloudPOS Multi-Tenant SaaS API' });
});

// Centralized Error Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[CloudPOS Server running in ${process.env.NODE_ENV || 'production'} mode on port ${PORT}]`);
});
