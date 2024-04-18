const mongoose = require('mongoose');
const flightTicketSchema = new mongoose.Schema({
  classId: {
    type: String,
    require: [true, 'Class Ticket is required.'],
    ref: 'TicketClass',
  },
  numOfTic: {
    type: Number,
    require: [true, 'Number of ticket is required.'],
  },
  seatBooked: {
    type: Number,
    default: 0,
    require: [true, 'Seat booked is required.'],
  },
});
module.exports = flightTicketSchema;
