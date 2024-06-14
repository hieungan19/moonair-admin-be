const factory = require('../handlers/factoryHandler');
const Rule = require('../models/ruleModel');

exports.getRule = factory.getAll(Rule);
exports.updateRule = factory.updateOne(Rule);
