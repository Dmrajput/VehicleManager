const ServiceRecord = require('../models/ServiceRecord');
const Vehicle = require('../models/Vehicle');
const asyncHandler = require('../utils/asyncHandler');

// @route POST /api/service
const createService = asyncHandler(async (req, res) => {
  const { vehicle, serviceType, cost, odometer, date, nextServiceDate, notes } = req.body;
  if (!vehicle || cost == null) {
    res.status(400);
    throw new Error('vehicle and cost are required');
  }

  const ownsVehicle = await Vehicle.findOne({ _id: vehicle, user: req.user._id });
  if (!ownsVehicle) {
    res.status(404);
    throw new Error('Vehicle not found');
  }

  const record = await ServiceRecord.create({
    user: req.user._id,
    vehicle,
    serviceType,
    cost,
    odometer,
    date: date || Date.now(),
    nextServiceDate,
    notes,
  });

  // Update the vehicle's next service date so reminders stay accurate.
  if (nextServiceDate) {
    ownsVehicle.nextServiceDate = nextServiceDate;
  }
  if (odometer && odometer > (ownsVehicle.odometer || 0)) {
    ownsVehicle.odometer = odometer;
  }
  await ownsVehicle.save();

  res.status(201).json({ success: true, data: record });
});

// @route GET /api/service?vehicle=&page=&limit=
const getServices = asyncHandler(async (req, res) => {
  const { vehicle } = req.query;
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);

  const filter = { user: req.user._id };
  if (vehicle) filter.vehicle = vehicle;

  const [items, total] = await Promise.all([
    ServiceRecord.find(filter)
      .populate('vehicle', 'number brand model type')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    ServiceRecord.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// @route DELETE /api/service/:id
const deleteService = asyncHandler(async (req, res) => {
  const record = await ServiceRecord.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!record) {
    res.status(404);
    throw new Error('Service record not found');
  }
  res.json({ success: true, message: 'Service record deleted' });
});

module.exports = { createService, getServices, deleteService };
