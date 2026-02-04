const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Product = require('./Product');

const CartItem = sequelize.define('CartItem', {
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    }
});

CartItem.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
User.hasMany(CartItem, { foreignKey: 'userId' });

CartItem.belongsTo(Product, { foreignKey: 'productId', onDelete: 'CASCADE' });
Product.hasMany(CartItem, { foreignKey: 'productId' });

module.exports = CartItem;
