const User = require('../models/User');

const getEmployees = async (req, res, next) => {
  try {
    // Fetch all users for this business, excluding the current requesting user
    const employees = await User.find({ 
      businessId: req.businessId,
      _id: { $ne: req.user.id } 
    }).select('-password');
    
    res.json(employees);
  } catch (error) {
    next(error);
  }
};

const createEmployee = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!['Cashier', 'InventoryManager'].includes(role)) {
      return res.status(400).json({ message: 'Invalid employee role. Options: Cashier, InventoryManager.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    const newEmployee = new User({
      name,
      email,
      password,
      role,
      businessId: req.businessId,
      status: 'active'
    });

    await newEmployee.save();

    const result = newEmployee.toObject();
    delete result.password;

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const updateEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, role, status } = req.body;

    const employee = await User.findOne({ _id: id, businessId: req.businessId });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found.' });
    }

    if (role && !['Cashier', 'InventoryManager', 'BusinessOwner'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role.' });
    }

    employee.name = name ?? employee.name;
    employee.email = email ?? employee.email;
    employee.role = role ?? employee.role;
    employee.status = status ?? employee.status;

    await employee.save();

    const result = employee.toObject();
    delete result.password;

    res.json(result);
  } catch (error) {
    next(error);
  }
};

const deleteEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await User.findOneAndDelete({ _id: id, businessId: req.businessId });
    if (!result) {
      return res.status(404).json({ message: 'Employee not found.' });
    }
    res.json({ message: 'Employee account deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee
};
