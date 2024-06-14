const express = require('express');
const router = express.Router();

const { protect } = require('../controllers/authController');
const {
  ticketsHistory,
  getOneTicket,
} = require('../controllers/buyTicketController');
router.route('/:id').get(protect, ticketsHistory);
router.route('/:id/:ticketId').get(protect, getOneTicket);
module.exports = router;
