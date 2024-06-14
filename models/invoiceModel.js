const mongoose = require('mongoose');
const boughtTicketSchema = require('./boughtTicketModel');
const Flight = require('./flightModel');
const invoiceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    require: [true, 'User id is required'],
    ref: 'User',
  },
  total: {
    type: Number,
    require: [true, 'Total is required'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  boughtTickets: [boughtTicketSchema],
});
//Trước khi save thì lưu thông tin boughtTicket vào chuyến bay đó
invoiceSchema.pre('save', async function (next) {
  for (const boughtTicket of this.boughtTickets) {
    const flight = await Flight.findById(boughtTicket.flight);
    //Nếu không tìm thấy chuyến bay thì xuất ra lỗi
    if (!flight) {
      return next(new Error('Flight not found for bought ticket.'));
    }
    console.log(flight.tickets);
    const temp = flight.tickets.find(
      (e) => e.class == boughtTicket.ticketClass,
    );
    temp.seatsBooked.push(boughtTicket.seatNo);
    // Save the updated flight
    await flight.save();
  }
  next();
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;
