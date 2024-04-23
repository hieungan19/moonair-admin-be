const express = require('express');
const router = express.Router();

const { protect, restrictTo } = require('../controllers/authController');
const {
  createInvoice,
  getAllInvoices,
  updateTicketStatus,
  getOneInvoice,
  getOneTicket,
} = require('../controllers/buyTicketController');
router
  .route('/')
  .post(protect, createInvoice)
  .patch(protect, updateTicketStatus)
  .get(protect, restrictTo('admin'), getAllInvoices);
router.route('/:id').get(protect, getOneInvoice);
router.route('/:invoiceId/ticket/:ticketId').get(protect, getOneTicket);
module.exports = router;
