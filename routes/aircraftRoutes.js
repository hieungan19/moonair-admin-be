const express = require('express');
const router = express.Router();

const { protect, restrictTo } = require('../controllers/authController');
const {
  getAllAircraft,
  createAircraft,
  getAircraftByID,
  deleteAircraft,
  updateAircraft,
} = require('../controllers/aircraftController');
router
  .route('/')
  .get(protect, getAllAircraft)
  .post(protect, restrictTo('admin'), createAircraft);

router
  .route('/:id')
  .get(getAircraftByID)
  .patch(protect, restrictTo('admin'), updateAircraft)
  .delete(protect, restrictTo('admin'), deleteAircraft);

module.exports = router;
