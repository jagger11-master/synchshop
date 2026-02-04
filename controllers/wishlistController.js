const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const ProductImage = require('../models/ProductImage');

exports.getWishlist = async (req, res) => {
    try {
        const items = await Wishlist.findAll({
            where: { userId: req.user.id },
            include: [{
                model: Product,
                include: [ProductImage]
            }]
        });
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;

        const [item, created] = await Wishlist.findOrCreate({
            where: { userId: req.user.id, productId }
        });

        if (!created) {
            return res.status(400).json({ message: 'Item already in wishlist' });
        }

        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.removeFromWishlist = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await Wishlist.findOne({ where: { id, userId: req.user.id } });

        if (!item) {
            return res.status(404).json({ error: 'Wishlist item not found' });
        }

        await item.destroy();
        res.json({ message: 'Removed from wishlist' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
