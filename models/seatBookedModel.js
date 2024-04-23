const mongoose = require('mongoose');
const seatBookedSchema = new mongoose.Schema({
  ticketClassId: mongoose.Schema.ObjectId,
  seatNo: Number,
});

module.exports = seatBookedSchema;
