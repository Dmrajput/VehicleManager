const mongoose = require('mongoose');

const fuelEntrySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    liters: { type: Number, required: true, min: 0 },
    odometer: { type: Number, default: 0 },
    date: { type: Date, default: Date.now },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FuelEntry', fuelEntrySchema);
