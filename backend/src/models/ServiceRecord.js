const mongoose = require('mongoose');

const serviceRecordSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true, index: true },
    serviceType: {
      type: String,
      enum: ['General Service', 'Oil Change', 'Repair', 'Washing'],
      default: 'General Service',
    },
    cost: { type: Number, required: true, min: 0 },
    odometer: { type: Number, default: 0 },
    date: { type: Date, default: Date.now },
    nextServiceDate: { type: Date, default: null },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ServiceRecord', serviceRecordSchema);
