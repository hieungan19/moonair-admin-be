const pushNotiController = require('../controllers/push_noti_controller');
const express = require('express');
const router = express.Router();
router.post('/send-noti', pushNotiController.sendPushNoti);
module.exports = router;
