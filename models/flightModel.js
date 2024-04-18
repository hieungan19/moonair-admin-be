const mongoose = require('mongoose');
const flightTicketSchema = require('./flightTicketModel');
const transitAirportSchema = require('./transitAirportModel');
const flightSchema = new mongoose.Schema({
  departureAirportId: {
    type: mongoose.Schema.ObjectId,
    require: [true, 'Departure Airport is required.'],
    ref: 'Airport',
  },
  destinationAirportId: {
    type: mongoose.Schema.ObjectId,
    require: [true, 'Destination Airport is required.'],
    ref: 'Airport',
  },
  aircraftId: {
    type: mongoose.Schema.ObjectId,
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
});

flightSchema.virtual('availableSeat').get(function () {
  return 0;
});
flightSchema.virtual('seatBooked').get(function () {});

flightSchema.pre(/^find/, function (next) {
  this.populate({});
});
const Flight = mongoose.model('Flight', flightSchema);
module.exports = Flight;
