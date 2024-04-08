const mongoose = require('mongoose');
const flightTicketSchema = require('./flightTicketModel');
const transitAirportSchema = require('./transitAirportModel');
const flightSchema = new mongoose.Schema({
  departureAirportId: {
    type: String,
    require: [true, 'Departure Airport is required.'],
    ref: 'Airport',
  },
  destinationAirportId: {
    type: String,
    require: [true, 'Destination Airport is required.'],
    ref: 'Airport',
  },
  aircraftId: {
    type: String,
    require: [true, 'Aircraft is required.'],
    ref: 'Aircraft',
  },
  departureTime: {
    type: Date,
    require: [true, 'Departure time is required.'],
  },
  takeoffTime: {
    type: Date,
    require: [true, 'Take off time is required.'],
  },
  price: {
    type: Number,
    require: [true, 'Price is required.'],
  },
  tickets: [flightTicketSchema],
  transitAirports: [transitAirportSchema],
  bookedSeat: {
    type: [Number],
  },
});

flightSchema.pre(/^find/, function (next) {
  this.populate({});
});
const Flight = mongoose.model('Flight', flightSchema);
module.exports = Flight;
