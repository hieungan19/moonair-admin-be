const mongoose = require('mongoose');
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
    require: [true, 'A airport must have a country.'],
  },
});

const Airport = mongoose.model('Airport', airportSchema);
module.exports = Airport;
