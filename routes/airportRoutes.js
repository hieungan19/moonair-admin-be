const express = require('express');
const router = express.Router();

const { protect, restrictTo } = require('../controllers/authController');
const {
  getAllAirport,
  createAirport,
  getAirportByID,
  deleteAirport,
  updateAirport,
} = require('../controllers/airportController');
router
  .route('/')
  .get(protect, getAllAirport)
  .post(protect, restrictTo('admin'), createAirport);

router
  .route('/:id')
  .get(getAirportByID)
  .patch(protect, restrictTo('admin'), updateAirport)
  .delete(protect, restrictTo('admin'), deleteAirport);

module.exports = router;
