const factory = require('../handlers/factoryHandler');
const TicketClass = require('../models/ticketClassModel');


exports.getAllTicketClass = factory.getAll(TicketClass);
exports.getTicketClassByID = factory.getOneById(TicketClass);
exports.createTicketClass = factory.createOne(TicketClass);
exports.updateTicketClass = factory.updateOne(TicketClass);
exports.deleteTicketClass = factory.deleteOne(TicketClass);
