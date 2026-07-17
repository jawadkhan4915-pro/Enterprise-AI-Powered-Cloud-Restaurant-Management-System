const express = require('express');
const auth = require('../../middlewares/auth.middleware');
const ctrl = require('../../controllers/notification.controller');

const router = express.Router();
router.use(auth);

router.get('/logs', ctrl.getNotificationLogs);
router.post('/test', ctrl.sendTestNotification);

module.exports = router;
