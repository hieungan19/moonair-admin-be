const mongoose = require('mongoose');
const { createCode } = require('../handlers/factoryHandler');
const boughtTicketSchema = new mongoose.Schema(
  {
    flight: {
      type: mongoose.Schema.ObjectId,
      ref: 'Flight',
    },
    ticketClass: {
      type: mongoose.Schema.ObjectId,
      ref: 'TicketClass',
    },
    seatNo: {
      type: Number,
      require: [true, 'Must have a seat number'],
    },
    passengerName: {
      type: String,
      require: [true],
    },
    phoneNumber: {
      type: String,
      // Sử dụng regular expression để kiểm tra xem số điện thoại chỉ chứa các chữ số
      match: [/^\d+$/, 'Phone number should contain only digits'],
    },
    dateOfBirth: Date,
    price: {
      type: Number,
      require: [true, 'Must have price'],
    },
    status: {
      type: Boolean, // 1: Payed, 2: Canceled
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

boughtTicketSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'flight',
    select: 'destinationAirport departureAiport transitAirport',
  }).populate({
    path: 'ticketClass',
    select: 'name',
  });
  next();
});

boughtTicketSchema.virtual('code').get(function () {
  return createCode(this.id);
});

module.exports = boughtTicketSchema;
