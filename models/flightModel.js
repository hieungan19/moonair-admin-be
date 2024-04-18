const mongoose = require('mongoose');
const flightTicketSchema = require('./flightTicketModel');
const transitAirportSchema = require('./transitAirportModel');
const { createCode } = require('../handlers/factoryHandler');
const flightSchema = new mongoose.Schema(
  {
    departureAirportId: {
      type: mongoose.Schema.ObjectId,
      require: [true, 'Departure Airport is required.'],
      ref: 'Airport',
    },
    destinationAirportId: {
      type: mongoose.Schema.ObjectId,
      require: [true, 'Destination Airport is required.'],
      ref: 'Airport',
      validate: {
        validator: function (value) {
          return value.toString() !== this.departureAirportId.toString();
        },
        message:
          'Destination Airport must be different from Departure Airport.',
      },
    },
    aircraftId: {
      type: mongoose.Schema.ObjectId,
      require: [true, 'Aircraft is required.'],
      ref: 'Aircraft',
    },

    takeoffTime: {
      type: Date,
      require: [true, 'Take off time is required.'],
    },
    landingTime: {
      type: Date,
      require: [true, 'Landing time is required.'],
      validate: {
        validator: function (value) {
          return value > this.takeoffTime;
        },
        message: 'Landing time must be after Take off time',
      },
    },
    price: {
      type: Number,
      require: [true, 'Price is required.'],
    },
    tickets: [flightTicketSchema],
    transitAirports: [transitAirportSchema],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

flightSchema.virtual('code').get(function () {
  return createCode(this.id);
});

flightSchema.virtual('duration').get(function () {
  // Lấy thời gian cất cánh và hạ cánh
  const takeoffTime = this.takeoffTime.getTime(); // Chuyển đổi sang milliseconds
  const landingTime = this.landingTime.getTime(); // Chuyển đổi sang milliseconds

  // Tính hiệu của thời gian hạ cánh và cất cánh, sau đó chuyển đổi kết quả thành giờ
  const durationInMs = landingTime - takeoffTime;
  const durationInHours = durationInMs / (1000 * 60 * 60); // 1000 milliseconds * 60 seconds * 60 minutes

  return durationInHours; // Trả về thời gian bay tính theo giờ
});

flightSchema.virtual('availableSeat').get(function () {
  const res = this.tickets.reduce((total, ticket) => {
    return total + ticket.numOfTic - ticket.seatBooked;
  }, 0);

  return res;
});

// flightSchema.pre(/^find/, function (next) {
//   this.populate({});
// });
// flightSchema.virtual('boughtTickets', {
//   foreignField: 'flightModel',
//   localField: '_id',
//   ref: 'BoughtTicket',
// });
const Flight = mongoose.model('Flight', flightSchema);
module.exports = Flight;
