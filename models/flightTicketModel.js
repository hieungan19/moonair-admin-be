const mongoose = require('mongoose');
const flightTicketSchema = new mongoose.Schema({
  class: {
    type: String,
    require: [true, 'Class Ticket is required.'],
    ref: 'TicketClass',
  },
  numOfTic: {
    type: Number,
    require: [true, 'Number of ticket is required.'],
  },
  seatsBooked: { type: [Number], default: [] },
});

module.exports = flightTicketSchema;
