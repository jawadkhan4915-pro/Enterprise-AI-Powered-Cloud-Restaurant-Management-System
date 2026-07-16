const express = require('express');
const { authLimiter } = require('../../middlewares/rateLimiter.middleware');
const validate = require('../../middlewares/validate.middleware');
const authValidator = require('../../validators/auth.validator');
const authController = require('../../controllers/auth.controller');

const router = express.Router();

// Apply auth rate limiting to credentials processing
router.use(authLimiter);

router.post('/register', authValidator.register, validate, authController.register);
router.post('/login', authValidator.login, validate, authController.login);
router.post('/logout', authController.logout);
router.post('/refresh-token', authController.refreshTokens);
router.post('/forgot-password', authValidator.forgotPassword, validate, authController.forgotPassword);
router.post('/reset-password', authValidator.resetPassword, validate, authController.resetPassword);
router.post('/verify-email', authValidator.verifyEmail, validate, authController.verifyEmail);
router.post('/send-otp', authController.sendOTP);

module.exports = router;
