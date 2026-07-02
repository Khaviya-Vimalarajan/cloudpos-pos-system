const Customer = require('../models/Customer');
const Order = require('../models/Order');

const getCustomers = async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = { businessId: req.businessId };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const customers = await Customer.find(query).sort({ name: 1 });
    res.json(customers);
  } catch (error) {
    next(error);
  }
};

const getCustomerById = async (req, res, next) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id, businessId: req.businessId });
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }
    
    // Get purchase history
    const purchases = await Order.find({ customerId: customer._id, businessId: req.businessId })
      .populate('cashierId', 'name')
      .sort({ createdAt: -1 });

    res.json({ customer, purchases });
  } catch (error) {
    next(error);
  }
};

const createCustomer = async (req, res, next) => {
  try {
    const { name, email, phone, notes, creditBalance } = req.body;
    
    const newCustomer = new Customer({
      businessId: req.businessId,
      name,
      email,
      phone,
      notes,
      creditBalance: creditBalance || 0
    });
    
    await newCustomer.save();
    res.status(201).json(newCustomer);
  } catch (error) {
    next(error);
  }
};

const updateCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, phone, notes, creditBalance, loyaltyPoints } = req.body;

    const customer = await Customer.findOne({ _id: id, businessId: req.businessId });
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    customer.name = name ?? customer.name;
    customer.email = email ?? customer.email;
    customer.phone = phone ?? customer.phone;
    customer.notes = notes ?? customer.notes;
    customer.creditBalance = creditBalance ?? customer.creditBalance;
    customer.loyaltyPoints = loyaltyPoints ?? customer.loyaltyPoints;

    await customer.save();
    res.json(customer);
  } catch (error) {
    next(error);
  }
};

const deleteCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await Customer.findOneAndDelete({ _id: id, businessId: req.businessId });
    if (!result) {
      return res.status(404).json({ message: 'Customer not found.' });
    }
    res.json({ message: 'Customer deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
};
