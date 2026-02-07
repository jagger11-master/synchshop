const Review = require('../models/Review');
const User = require('../models/User');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');

exports.addReview = async (req, res) => {
    try {
        const { productId, rating, comment } = req.body;
        const userId = req.user.id;

        // Verify purchase
        const hasPurchased = await Order.findOne({
            where: { userId, status: 'paid' },
            include: [{
                model: OrderItem,
                where: { productId }
            }]
        });

        if (!hasPurchased) {
            return res.status(403).json({ error: 'You can only review products you have purchased.' });
        }

        // Check if already reviewed
        const existingReview = await Review.findOne({ where: { productId, userId } });
        if (existingReview) {
            return res.status(400).json({ error: 'You have already reviewed this product.' });
        }

        const review = await Review.create({
            productId,
            userId,
            rating,
            comment
        });

        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.findAll({
            include: [
                { model: User, attributes: ['username', 'email'] },
                { model: Product, attributes: ['name', 'id'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        const reviews = await Review.findAll({
            where: { productId },
            include: [{ model: User, attributes: ['username'] }]
        });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
