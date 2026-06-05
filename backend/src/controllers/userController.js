const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const FuelEntry = require('../models/FuelEntry');
const ServiceRecord = require('../models/ServiceRecord');
const asyncHandler = require('../utils/asyncHandler');

// @route GET /api/user/profile
const getProfile = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user.toSafeJSON() });
});

// @route PUT /api/user/profile
const updateProfile = asyncHandler(async (req, res) => {
  const { name, email, profileImage, settings } = req.body;
  const user = await User.findById(req.user._id);

  if (name !== undefined) user.name = name;
  if (email !== undefined) user.email = email;
  if (profileImage !== undefined) user.profileImage = profileImage;
  if (settings) {
    user.settings = { ...user.settings.toObject(), ...settings };
  }

  await user.save();
  res.json({ success: true, data: user.toSafeJSON() });
});

const startOfMonth = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
};

// @route GET /api/user/dashboard
// Aggregated payload for the home dashboard & expenses screens.
const getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const monthStart = startOfMonth();

  const [vehicleCount, recentFuel, recentServices, monthFuel, monthService] = await Promise.all([
    Vehicle.countDocuments({ user: userId }),
    FuelEntry.find({ user: userId }).populate('vehicle', 'number brand model').sort({ date: -1 }).limit(5),
    ServiceRecord.find({ user: userId }).populate('vehicle', 'number brand model').sort({ date: -1 }).limit(5),
    FuelEntry.find({ user: userId, date: { $gte: monthStart } }),
    ServiceRecord.find({ user: userId, date: { $gte: monthStart } }),
  ]);

  const monthlyFuelCost = monthFuel.reduce((s, f) => s + f.amount, 0);
  const monthlyServiceCost = monthService.reduce((s, v) => s + v.cost, 0);

  res.json({
    success: true,
    data: {
      totalVehicles: vehicleCount,
      monthlyFuelCost,
      monthlyServiceCost,
      monthlyTotal: monthlyFuelCost + monthlyServiceCost,
      recentFuel,
      recentServices,
    },
  });
});

// @route GET /api/user/expenses?months=6
// Monthly fuel/service trend for charts.
const getExpenseTrends = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const months = Math.min(parseInt(req.query.months || '6', 10), 12);

  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

  const [fuel, services] = await Promise.all([
    FuelEntry.find({ user: userId, date: { $gte: startDate } }),
    ServiceRecord.find({ user: userId, date: { $gte: startDate } }),
  ]);

  const buckets = [];
  for (let i = months - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleString('en-US', { month: 'short' }),
      fuel: 0,
      service: 0,
    });
  }
  const indexFor = (date) => {
    const d = new Date(date);
    return buckets.findIndex((b) => b.key === `${d.getFullYear()}-${d.getMonth()}`);
  };

  fuel.forEach((f) => {
    const idx = indexFor(f.date);
    if (idx >= 0) buckets[idx].fuel += f.amount;
  });
  services.forEach((s) => {
    const idx = indexFor(s.date);
    if (idx >= 0) buckets[idx].service += s.cost;
  });

  res.json({
    success: true,
    data: {
      labels: buckets.map((b) => b.label),
      fuel: buckets.map((b) => Math.round(b.fuel)),
      service: buckets.map((b) => Math.round(b.service)),
      totalFuel: fuel.reduce((s, f) => s + f.amount, 0),
      totalService: services.reduce((s, v) => s + v.cost, 0),
    },
  });
});

module.exports = { getProfile, updateProfile, getDashboard, getExpenseTrends };
