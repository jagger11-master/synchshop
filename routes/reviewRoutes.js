const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/:productId', reviewController.getProductReviews);
router.get('/', protect, admin, reviewController.getAllReviews);
router.post('/', protect, reviewController.addReview);

module.exports = router;
