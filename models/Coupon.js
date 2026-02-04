const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Coupon = sequelize.define('Coupon', {
    code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    discountPercentage: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1, max: 100 }
    },
    expiryDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
});

module.exports = Coupon;
