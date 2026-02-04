const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Product = require('./Product');
const User = require('./User');

const Review = sequelize.define('Review', {
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1, max: 5 }
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: true
    }
});

Review.belongsTo(Product, { foreignKey: 'productId', onDelete: 'CASCADE' });
Product.hasMany(Review, { foreignKey: 'productId' });

Review.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
User.hasMany(Review, { foreignKey: 'userId' });

module.exports = Review;
