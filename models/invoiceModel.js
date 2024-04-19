const mongoose = require('mongoose');
const invoiceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    require: [true, 'User id is required'],
  },
  total: {
    type: Number,
    require: [true, 'Total is required'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  paymentStatus: {
    type: Boolean,
    default: false,
  },
});
const Invoice = mongoose.model('Invoice', invoiceSchema);
module.exports = Invoice;
