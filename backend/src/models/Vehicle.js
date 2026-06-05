const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['Bike', 'Car'], required: true },
    number: { type: String, required: true, trim: true, uppercase: true },
    brand: { type: String, trim: true, default: '' },
    model: { type: String, trim: true, default: '' },
    year: { type: Number },
    fuelType: {
      type: String,
      enum: ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'],
      default: 'Petrol',
    },
    image: { type: String, default: '' },
    odometer: { type: Number, default: 0 },
    // Renewal dates that power the reminder system
    insuranceExpiry: { type: Date, default: null },
    pucExpiry: { type: Date, default: null },
    nextServiceDate: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

vehicleSchema.index({ user: 1, number: 1 }, { unique: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
