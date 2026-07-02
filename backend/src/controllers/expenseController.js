const Expense = require('../models/Expense');

const getExpenses = async (req, res, next) => {
  try {
    const { category, startDate, endDate } = req.query;
    let query = { businessId: req.businessId };

    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const expenses = await Expense.find(query)
      .populate('userId', 'name')
      .sort({ date: -1 });

    res.json(expenses);
  } catch (error) {
    next(error);
  }
};

const createExpense = async (req, res, next) => {
  try {
    const { amount, category, description, date } = req.body;
    const newExpense = new Expense({
      businessId: req.businessId,
      amount,
      category,
      description,
      date: date || new Date(),
      userId: req.user.id
    });
    await newExpense.save();
    res.status(201).json(newExpense);
  } catch (error) {
    next(error);
  }
};

const deleteExpense = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await Expense.findOneAndDelete({ _id: id, businessId: req.businessId });
    if (!result) {
      return res.status(404).json({ message: 'Expense not found.' });
    }
    res.json({ message: 'Expense deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getExpenses,
  createExpense,
  deleteExpense
};
