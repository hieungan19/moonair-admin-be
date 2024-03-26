const mongoose = require('mongoose');
const airportSchema = new mongoose.Schema({
  name: {
    type: String,
    require: [true, 'A airport must have a name'],
  },
  city: {
    type: String,
    require: [true, 'A airport must have a city'],
  },
});

const Airport = mongoose.model('Airport', airportSchema);
module.exports = Airport;
