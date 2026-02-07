const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { protect } = require('../middleware/authMiddleware');

// All wishlist routes require authentication
router.use(protect);

// Get user's wishlist
router.get('/', wishlistController.getWishlist);

// Add item to wishlist
router.post('/', wishlistController.addToWishlist);

// Remove item from wishlist
router.delete('/:id', wishlistController.removeFromWishlist);

module.exports = router;
