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
    require: [true, 'Seat booked is required.'],
  },
});
module.exports = flightTicketSchema;
