const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../config/uploadConfig');

router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.get('/:id/related', productController.getRelatedProducts);

router.post('/', protect, admin, upload.array('images', 5), productController.createProduct);
router.put('/:id', protect, admin, productController.updateProduct);
router.delete('/:id', protect, admin, productController.deleteProduct);

module.exports = router;
