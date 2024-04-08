const mongoose = require('mongoose');
const transitAirportSchema = new mongoose.Schema({
  airportId: {
    type: String,
    require: [true, 'Airport is required.'],
  },
  aircraftId: {
    type: String,
    require: [true, 'Next aircraft is required.'],
  },
  transitStartTime: {
    type: Date,
    require: [true, 'Start time is required.'],
  },
  transitEndTime: {
    type: Date,
    require: [true, 'End time is required'],
  },
  transitNote: {
    type: String,
  },
});

module.exports = transitAirportSchema;
