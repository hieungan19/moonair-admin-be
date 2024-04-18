const mongoose = require('mongoose');
const invoiceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    require: [true, 'User id is required'],
  },
});
const Invoice = mongoose.model('Invoice', invoiceSchema);
module.exports = Invoice;
