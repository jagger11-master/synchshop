const Coupon = require('../models/Coupon');
const { Op } = require('sequelize');

exports.createCoupon = async (req, res) => {
    try {
        const { code, discountPercentage, expiryDate } = req.body;
        const coupon = await Coupon.create({ code, discountPercentage, expiryDate });
        res.status(201).json(coupon);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.validateCoupon = async (req, res) => {
    try {
        const { code } = req.body;
        const coupon = await Coupon.findOne({
            where: {
                code,
                isActive: true,
                expiryDate: { [Op.gt]: new Date() }
            }
        });

        if (!coupon) {
            return res.status(404).json({ error: 'Invalid or expired coupon' });
        }

        res.json(coupon);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.findAll({ order: [['createdAt', 'DESC']] });
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        await Coupon.destroy({ where: { id } });
        res.json({ message: 'Coupon deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
