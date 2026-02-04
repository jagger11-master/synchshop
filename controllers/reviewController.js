const Review = require('../models/Review');
const User = require('../models/User');

exports.addReview = async (req, res) => {
    try {
        const { productId, rating, comment } = req.body;
        const userId = req.user.id;

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
