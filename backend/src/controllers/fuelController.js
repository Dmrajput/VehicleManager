const FuelEntry = require('../models/FuelEntry');
const Vehicle = require('../models/Vehicle');
const asyncHandler = require('../utils/asyncHandler');

// @route POST /api/fuel
const createFuel = asyncHandler(async (req, res) => {
  const { vehicle, amount, liters, odometer, date, notes } = req.body;
  if (!vehicle || amount == null || liters == null) {
    res.status(400);
    throw new Error('vehicle, amount and liters are required');
  }

  const ownsVehicle = await Vehicle.findOne({ _id: vehicle, user: req.user._id });
  if (!ownsVehicle) {
    res.status(404);
    throw new Error('Vehicle not found');
  }

  const entry = await FuelEntry.create({
    user: req.user._id,
    vehicle,
    amount,
    liters,
    odometer,
    date: date || Date.now(),
    notes,
  });

  // Keep vehicle odometer in sync with the latest reading.
  if (odometer && odometer > (ownsVehicle.odometer || 0)) {
    ownsVehicle.odometer = odometer;
    await ownsVehicle.save();
  }

  res.status(201).json({ success: true, data: entry });
});

// @route GET /api/fuel?vehicle=&page=&limit=
const getFuel = asyncHandler(async (req, res) => {
  const { vehicle } = req.query;
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);

  const filter = { user: req.user._id };
  if (vehicle) filter.vehicle = vehicle;

  const [items, total] = await Promise.all([
    FuelEntry.find(filter)
      .populate('vehicle', 'number brand model type')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    FuelEntry.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// @route DELETE /api/fuel/:id
const deleteFuel = asyncHandler(async (req, res) => {
  const entry = await FuelEntry.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!entry) {
    res.status(404);
    throw new Error('Fuel entry not found');
  }
  res.json({ success: true, message: 'Fuel entry deleted' });
});

module.exports = { createFuel, getFuel, deleteFuel };
