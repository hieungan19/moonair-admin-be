const express = require('express');
const { protect, restrictTo } = require('../controllers/authController');
const {
  getAllTicketClass,
  createTicketClass,
  getTicketClassByID,
  updateTicketClass,
  deleteTicketClass,
} = require('../controllers/ticketClassController');
const router = express.Router();
router
  .route('/')
  .get(protect, getAllTicketClass)
  .post(protect, restrictTo('admin'), createTicketClass);
router
  .route('/:id')
  .get(getTicketClassByID)
  .patch(protect, restrictTo('admin'), updateTicketClass)
  .delete(protect, restrictTo('admin'), deleteTicketClass);

module.exports = router;
