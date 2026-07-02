const Supplier = require('../models/Supplier');

const getSuppliers = async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = { businessId: req.businessId };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { contactName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const suppliers = await Supplier.find(query).sort({ name: 1 });
    res.json(suppliers);
  } catch (error) {
    next(error);
  }
};

const createSupplier = async (req, res, next) => {
  try {
    const { name, contactName, email, phone, address, outstandingPayment } = req.body;
    const newSupplier = new Supplier({
      businessId: req.businessId,
      name,
      contactName,
      email,
      phone,
      address,
      outstandingPayment: outstandingPayment || 0
    });
    await newSupplier.save();
    res.status(201).json(newSupplier);
  } catch (error) {
    next(error);
  }
};

const updateSupplier = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, contactName, email, phone, address, outstandingPayment } = req.body;

    const supplier = await Supplier.findOne({ _id: id, businessId: req.businessId });
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found.' });
    }

    supplier.name = name ?? supplier.name;
    supplier.contactName = contactName ?? supplier.contactName;
    supplier.email = email ?? supplier.email;
    supplier.phone = phone ?? supplier.phone;
    supplier.address = address ?? supplier.address;
    supplier.outstandingPayment = outstandingPayment ?? supplier.outstandingPayment;

    await supplier.save();
    res.json(supplier);
  } catch (error) {
    next(error);
  }
};

const deleteSupplier = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await Supplier.findOneAndDelete({ _id: id, businessId: req.businessId });
    if (!result) {
      return res.status(404).json({ message: 'Supplier not found.' });
    }
    res.json({ message: 'Supplier deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier
};
