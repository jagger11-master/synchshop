const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect, admin);

router.get('/orders', adminController.getAllOrders);
router.get('/users', adminController.getAllUsers);
router.get('/stats', adminController.getDashboardStats);
router.get('/analytics', adminController.getAnalytics);
router.put('/status', adminController.updateOrderStatus);
router.put('/stock', adminController.updateStockManual);

module.exports = router;
