const express = require('express');
const router = express.Router();

const { protect, restrictTo } = require('../controllers/authController');
const {
  createInvoice,
  getAllInvoices,
  updateTicketStatus,
  getOneInvoice,
} = require('../controllers/buyTicketController');
router
  .route('/')
  .post(protect, createInvoice)

  .get(protect, restrictTo('admin'), getAllInvoices);
router.route('/:id').get(protect, getOneInvoice);
router.route('/ticket/:ticketId').delete(protect, updateTicketStatus);

module.exports = router;
