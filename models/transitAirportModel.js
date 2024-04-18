const mongoose = require('mongoose');
const transitAirportSchema = new mongoose.Schema({
  airportId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Airport',
    require: [true, 'Airport is required.'],
  },
  aircraftId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Aircraft',
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
