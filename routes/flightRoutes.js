const express = require('express');
const { protect, restrictTo } = require('../controllers/authController');
const {
  createFlight,
  getFlightsByFromToCityAndDate,
} = require('../controllers/flightController');
const router = express.Router();

router.route('/').post(protect, restrictTo('admin'), createFlight);
router.route('/').get(protect, getFlightsByFromToCityAndDate);
module.exports = router;
