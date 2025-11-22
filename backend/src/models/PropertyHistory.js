const mongoose = require('mongoose');

const propertyHistorySchema = new mongoose.Schema({
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true,
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  changes: {
    type: Object, // Store diff or full snapshot
    required: true,
  },
  changedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('PropertyHistory', propertyHistorySchema);
