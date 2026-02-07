const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/profile', protect, userController.getProfile);
router.put('/profile', protect, userController.updateProfile);
router.put('/profile/password', protect, userController.changePassword);

router.get('/addresses', protect, userController.getAddresses);
// router.post('/addresses', protect, userController.addAddress);
// router.delete('/addresses/:id', protect, userController.deleteAddress);

module.exports = router;
