const factory = require('../handlers/factoryHandler');
const AirCraft = require('../models/aircraftModel');

exports.getAllAircraft = factory.getAll(AirCraft);
exports.getAircraftByID = factory.getOneById(AirCraft);
exports.createAircraft = factory.createOne(AirCraft);
exports.updateAircraft = factory.updateOne(AirCraft);
exports.deleteAircraft = factory.deleteOne(AirCraft);
