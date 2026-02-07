const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/validate', protect, couponController.validateCoupon);
router.get('/', protect, admin, couponController.getAllCoupons);
router.post('/', protect, admin, couponController.createCoupon);
router.delete('/:id', protect, admin, couponController.deleteCoupon);

module.exports = router;
