const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', checkoutController.processCheckout);
router.get('/history', checkoutController.getOrderHistory);

module.exports = router;
