const mongoose = require('mongoose');
const { createCode } = require('../handlers/factoryHandler');
const airportSchema = new mongoose.Schema({
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
    default: 'Vietnam',
    require: [true, 'A airport must have a country.'],
  },
});
airportSchema.virtual('code').get(function () {
  return createCode(this.id);
});
const Airport = mongoose.model('Airport', airportSchema);
module.exports = Airport;
