const mongoose = require('mongoose');

const ruleSchema = new mongoose.Schema({
  minFlightTime: {
    type: Number,
  },
  maxNumOfTransitAirport: {
    type: Number,
  },
  maxTransitTime: {
    type: Number,
  },
  latestTimeForBooking: {
    type: Number,
  },
  deadlineForCancelingTicket: {
    type: Number,
  },
});

const Rule = mongoose.model('Rule', ruleSchema);
module.exports = Rule;
