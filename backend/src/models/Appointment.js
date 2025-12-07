const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'denied'], default: 'pending' },
  requestedAt: { type: Date, default: Date.now },
  decidedAt: { type: Date },
  meetingDate: { type: Date },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  message: { type: String },
  denialReason: { type: String },
});

module.exports = mongoose.model('Appointment', appointmentSchema);
