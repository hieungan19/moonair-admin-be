const mongoose = require('mongoose');
const boughtTicketSchema = new mongoose.Schema({
  userId: {},
  invoiceId: {},
  flightId: {},
  passengerName: {},
  phoneNumber: {},
  citizenId: {},
  passportId: {},
  ticketClassId: {},
  price: {},
  status: {},
  seatNo: {},
});
const BoughtTicket = mongoose.model('BoughtTicket', boughtTicketSchema);
module.exports = BoughtTicket;
