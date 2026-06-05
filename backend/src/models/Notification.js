const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', default: null },
    type: {
      type: String,
      enum: ['Service', 'Insurance', 'PUC'],
      required: true,
    },
    title: { type: String, required: true },
    body: { type: String, default: '' },
    dueDate: { type: Date, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
