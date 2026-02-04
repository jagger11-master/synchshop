const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:productId', reviewController.getProductReviews);
router.post('/', protect, reviewController.addReview);

module.exports = router;
