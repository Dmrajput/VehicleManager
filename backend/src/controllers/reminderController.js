const Vehicle = require('../models/Vehicle');
const asyncHandler = require('../utils/asyncHandler');

const daysBetween = (date) => {
  if (!date) return null;
  const diff = new Date(date).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const buildReminder = (vehicle, type, dueDate) => {
  if (!dueDate) return null;
  const days = daysBetween(dueDate);
  return {
    vehicleId: vehicle._id,
    vehicleName: `${vehicle.brand} ${vehicle.model}`.trim() || vehicle.number,
    vehicleNumber: vehicle.number,
    type,
    dueDate,
    daysLeft: days,
    status: days < 0 ? 'overdue' : days <= 7 ? 'urgent' : days <= 30 ? 'soon' : 'upcoming',
  };
};

// @route GET /api/reminders
const getReminders = asyncHandler(async (req, res) => {
  const vehicles = await Vehicle.find({ user: req.user._id });

  const reminders = [];
  vehicles.forEach((v) => {
    [
      buildReminder(v, 'Service', v.nextServiceDate),
      buildReminder(v, 'Insurance', v.insuranceExpiry),
      buildReminder(v, 'PUC', v.pucExpiry),
    ].forEach((r) => {
      if (r) reminders.push(r);
    });
  });

  reminders.sort((a, b) => (a.daysLeft ?? 9999) - (b.daysLeft ?? 9999));

  res.json({ success: true, count: reminders.length, data: reminders });
});

module.exports = { getReminders };
