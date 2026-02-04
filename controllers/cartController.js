const CartItem = require('../models/CartItem');
const Product = require('../models/Product');
const ProductImage = require('../models/ProductImage');

exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.user.id;

        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        let cartItem = await CartItem.findOne({ where: { userId, productId } });

        if (cartItem) {
            cartItem.quantity += parseInt(quantity);
            await cartItem.save();
        } else {
            cartItem = await CartItem.create({ userId, productId, quantity });
        }

        res.status(201).json(cartItem);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const cartItems = await CartItem.findAll({
            where: { userId },
            include: [
                {
                    model: Product,
                    include: [ProductImage]
                }
            ]
        });
        res.json(cartItems);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateCartItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;
        const userId = req.user.id;

        const cartItem = await CartItem.findOne({ where: { id, userId } });

        if (!cartItem) {
            return res.status(404).json({ error: 'Cart item not found' });
        }

        cartItem.quantity = quantity;
        await cartItem.save();

        res.json(cartItem);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.removeFromCart = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const cartItem = await CartItem.findOne({ where: { id, userId } });

        if (!cartItem) {
            return res.status(404).json({ error: 'Cart item not found' });
        }

        await cartItem.destroy();
        res.json({ message: 'Item removed from cart' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
