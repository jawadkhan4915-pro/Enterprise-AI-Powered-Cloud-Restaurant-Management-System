const express = require('express');
const auth = require('../../middlewares/auth.middleware');
const userController = require('../../controllers/user.controller');

const router = express.Router();

// Require authorization for all user profile actions
router.use(auth);

router.route('/me')
  .get(userController.getProfile)
  .patch(userController.updateProfile);

router.get('/me/sessions', userController.getSessions);
router.delete('/me/sessions/:sessionId', userController.deleteSession);
router.get('/me/activity', userController.getActivityLogs);

module.exports = router;
