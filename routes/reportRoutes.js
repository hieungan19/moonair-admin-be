const express = require('express');
const router = express.Router();

const { protect, restrictTo } = require('../controllers/authController');
const {
  todayReport,
  monthlyReport,
} = require('../controllers/reportController');
router.route('/today').get(protect, restrictTo('admin'), todayReport);
router.route('/months').get(protect, restrictTo('admin'), monthlyReport);
module.exports = router;
