const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, addressController.createAddress);
router.get('/', protect, addressController.getAddresses);
router.delete('/:id', protect, addressController.deleteAddress);

module.exports = router;
