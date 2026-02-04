const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Product = require('./Product');

const ProductVariant = sequelize.define('ProductVariant', {
    name: {
        type: DataTypes.STRING, // e.g., Color, Size
        allowNull: false
    },
    value: {
        type: DataTypes.STRING, // e.g., Red, Large
        allowNull: false
    },
    priceModifier: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
});

ProductVariant.belongsTo(Product, { foreignKey: 'productId', onDelete: 'CASCADE' });
Product.hasMany(ProductVariant, { foreignKey: 'productId' });

module.exports = ProductVariant;
