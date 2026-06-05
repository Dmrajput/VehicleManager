// Seeds a demo user with two vehicles and sample fuel/service records.
// Usage: npm run seed
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const FuelEntry = require('../models/FuelEntry');
const ServiceRecord = require('../models/ServiceRecord');

const daysFromNow = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

const run = async () => {
  await connectDB();

  const mobile = '9999999999';
  await User.deleteOne({ mobile });

  const user = await User.create({
    name: 'Demo User',
    mobile,
    email: 'demo@vehiclemanager.app',
    isVerified: true,
  });

  await Vehicle.deleteMany({ user: user._id });

  const car = await Vehicle.create({
    user: user._id,
    type: 'Car',
    number: 'MH01AB1234',
    brand: 'Honda',
    model: 'City',
    year: 2021,
    fuelType: 'Petrol',
    odometer: 12500,
    insuranceExpiry: daysFromNow(96),
    pucExpiry: daysFromNow(60),
    nextServiceDate: daysFromNow(10),
  });

  const bike = await Vehicle.create({
    user: user._id,
    type: 'Bike',
    number: 'MH01BS5678',
    brand: 'TVS',
    model: 'Apache RTR 160',
    year: 2022,
    fuelType: 'Petrol',
    odometer: 8200,
    insuranceExpiry: daysFromNow(120),
    pucExpiry: daysFromNow(20),
    nextServiceDate: daysFromNow(45),
  });

  await FuelEntry.create([
    { user: user._id, vehicle: car._id, amount: 1500, liters: 14, odometer: 12500, date: daysFromNow(-2) },
    { user: user._id, vehicle: car._id, amount: 1200, liters: 11, odometer: 12000, date: daysFromNow(-16) },
    { user: user._id, vehicle: bike._id, amount: 400, liters: 4, odometer: 8200, date: daysFromNow(-5) },
  ]);

  await ServiceRecord.create([
    {
      user: user._id,
      vehicle: car._id,
      serviceType: 'General Service',
      cost: 2500,
      odometer: 12000,
      date: daysFromNow(-30),
      nextServiceDate: daysFromNow(10),
      notes: 'Engine oil changed, general checkup done.',
    },
  ]);

  console.log('Seeded demo user. Login with mobile:', mobile);
  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
