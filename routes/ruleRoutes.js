const express = require('express');
const router = express.Router();

const { protect, restrictTo } = require('../controllers/authController');
const { getRule, updateRule } = require('../controllers/ruleController');
router.route('/').get(protect, getRule);
router.route('/:id').patch(protect, restrictTo('admin'), updateRule);

module.exports = router;
