const mongoose = require('mongoose');
const flightTicketSchema = require('./flightTicketModel');
const transitAirportSchema = require('./transitAirportModel');
const { createCode } = require('../handlers/factoryHandler');
const Rule = require('./ruleModel');
const AppError = require('../utils/appError');
const flightSchema = new mongoose.Schema(
  {
    departureAirport: {
      type: mongoose.Schema.ObjectId,
      require: [true, 'Departure Airport is required.'],
      ref: 'Airport',
    },
    destinationAirport: {
      type: mongoose.Schema.ObjectId,
      require: [true, 'Destination Airport is required.'],
      ref: 'Airport',
      validate: {
        validator: function (value) {
          return value.toString() !== this.departureAirport.toString();
        },
        message:
          'Destination Airport must be different from Departure Airport.',
      },
    },
    aircraft: {
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
    createdAt: {
      type: Date,
      default: Date.now(),
    },
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
  const durationInMinutes = durationInMs / (1000 * 60); // 1000 milliseconds * 60 seconds

  return durationInMinutes; // Trả về thời gian bay tính theo giờ
});

flightSchema.virtual('code').get(function () {
  return createCode(this.id);
});

flightSchema.virtual('availableSeats').get(function () {
  let res = 0;
  if (this.tickets) {
    res = this.tickets.reduce((total, ticket) => {
      return total + ticket.numOfTic - ticket.seatsBooked.length;
    }, 0);
  }

  return res;
});

// Hook để kiểm tra duration trước khi lưu
flightSchema.pre('save', async function (next) {
  const minFlightTimeRule = await Rule.findOne({
    minFlightTime: { $exists: true },
  });

  if (minFlightTimeRule && this.duration < minFlightTimeRule.minFlightTime) {
    return next(
      new AppError(
        'Duration must be greater than or equal to minFlightTime.',
        400,
      ),
    );
  }

  next();
});

// Hook để kiểm tra số lượng transit airport trước khi lưu
flightSchema.pre('save', async function (next) {
  const rule = await Rule.findOne({
    maxNumOfTransitAirport: { $exists: true },
    minFlightTime: { $exists: true },
  });

  if (rule && this.transitAirports.length > rule.maxNumOfTransitAirport) {
    return next(
      new AppError(
        'Number of transit airports exceeds the maximum allowed.',
        400,
      ),
    );
  }

  if (rule && this.duration < rule.minFlightTime) {
    return next(
      new AppError(
        'Duration must be greater than or equal to minFlightTime.',
        400,
      ),
    );
  }
  next();
});

const Flight = mongoose.model('Flight', flightSchema);
module.exports = Flight;
