const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Product = require('./Product');

const ProductImage = sequelize.define('ProductImage', {
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

ProductImage.belongsTo(Product, { foreignKey: 'productId', onDelete: 'CASCADE' });
Product.hasMany(ProductImage, { foreignKey: 'productId' });

module.exports = ProductImage;
