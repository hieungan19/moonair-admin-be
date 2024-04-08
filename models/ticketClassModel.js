const mongoose = require('mongoose');
const ticketClassSchema = new mongoose.Schema({
  name: {
    type: String,
    require: [true, 'A ticket class must have a name.'],
  },
  ratio: {
    type: String,
    require: [true, 'Ratio is required.'],
  },
});

const TicketClass = mongoose.model('TicketClass', ticketClassSchema);
module.exports = TicketClass;
