const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validateRegistration = require('../middleware/validateRegistration');

router.post('/signup', validateRegistration, authController.register);
router.post('/admin/signup', validateRegistration, authController.adminRegister);
router.post('/resend-otp', authController.resendOTP);
router.post('/verify-otp', authController.verifyOTP);

module.exports = router;
