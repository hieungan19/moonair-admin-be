const express = require('express');
const { protect, restrictTo } = require('../controllers/authController');
const {
  createFlight,
  deleteFlight,
  getFlightById,
  getFlights,
} = require('../controllers/flightController');
const router = express.Router();

router.route('/').post(protect, restrictTo('admin'), createFlight);
router.route('/').get(protect, getFlights);

router.route('/:id').delete(protect, restrictTo('admin'), deleteFlight);
router.route('/:id').get(protect, getFlightById);
module.exports = router;
