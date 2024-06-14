const factory = require('../handlers/factoryHandler');
const Airport = require('../models/airportModel');

exports.getAllAirport = factory.getAll(Airport);
exports.getAirportByID = factory.getOneById(Airport);
exports.createAirport = factory.createOne(Airport);
exports.updateAirport = factory.updateOne(Airport);
exports.deleteAirport = factory.deleteOne(Airport);
