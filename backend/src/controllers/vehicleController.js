const Vehicle = require('../models/Vehicle');
const FuelEntry = require('../models/FuelEntry');
const ServiceRecord = require('../models/ServiceRecord');
const asyncHandler = require('../utils/asyncHandler');

// @route POST /api/vehicle
const createVehicle = asyncHandler(async (req, res) => {
  const payload = { ...req.body, user: req.user._id };
  const vehicle = await Vehicle.create(payload);
  res.status(201).json({ success: true, data: vehicle });
});

// @route GET /api/vehicle
const getVehicles = asyncHandler(async (req, res) => {
  const vehicles = await Vehicle.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, count: vehicles.length, data: vehicles });
});

// @route GET /api/vehicle/:id
const getVehicleById = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findOne({ _id: req.params.id, user: req.user._id });
  if (!vehicle) {
    res.status(404);
    throw new Error('Vehicle not found');
  }

  const [fuel, services] = await Promise.all([
    FuelEntry.find({ vehicle: vehicle._id }).sort({ date: -1 }).limit(20),
    ServiceRecord.find({ vehicle: vehicle._id }).sort({ date: -1 }).limit(20),
  ]);

  const totalFuelCost = fuel.reduce((s, f) => s + f.amount, 0);
  const totalServiceCost = services.reduce((s, v) => s + v.cost, 0);

  res.json({
    success: true,
    data: {
      vehicle,
      fuel,
      services,
      stats: {
        totalFuelEntries: fuel.length,
        totalServices: services.length,
        totalExpenses: totalFuelCost + totalServiceCost,
      },
    },
  });
});

// @route PUT /api/vehicle/:id
const updateVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!vehicle) {
    res.status(404);
    throw new Error('Vehicle not found');
  }
  res.json({ success: true, data: vehicle });
});

// @route DELETE /api/vehicle/:id
const deleteVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!vehicle) {
    res.status(404);
    throw new Error('Vehicle not found');
  }
  await Promise.all([
    FuelEntry.deleteMany({ vehicle: vehicle._id }),
    ServiceRecord.deleteMany({ vehicle: vehicle._id }),
  ]);
  res.json({ success: true, message: 'Vehicle and related records deleted' });
});

module.exports = {
  createVehicle,
  getVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
};
