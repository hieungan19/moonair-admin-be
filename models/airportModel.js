const mongoose = require('mongoose');
const { createCityCode } = require('../handlers/factoryHandler');
const airportSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: [true, 'A airport must have a name.'],
    },
    city: {
      type: String,
      require: [true, 'A airport must have a city.'],
    },
    country: {
      type: String,
      default: 'Viet Nam',
      require: [true, 'A airport must have a country.'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
airportSchema.virtual('cityCode').get(function () {
  return createCityCode(this.city);
});

const Airport = mongoose.model('Airport', airportSchema);
module.exports = Airport;
