const mongoose = require('mongoose');
const aircraftSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: [true, 'A aircraft must have a name'],
    },
    manufacturer: {
      type: String,
      require: [true, 'A aircraft must have a manufacture'],
    },
    capacity: {
      type: Number,
      min: [2, 'Capacity must be above 1'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
const Aircraft = mongoose.model('Aircraft', aircraftSchema);
module.exports = Aircraft;
