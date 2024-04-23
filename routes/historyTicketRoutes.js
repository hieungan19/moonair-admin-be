const express = require('express');
const router = express.Router();

const { protect } = require('../controllers/authController');
const { ticketsHistory } = require('../controllers/buyTicketController');
router.route('/:id').get(protect, ticketsHistory);
module.exports = router;
