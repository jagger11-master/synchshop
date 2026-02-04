const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Order = require('./Order');
const Product = require('./Product');

const OrderItem = sequelize.define('OrderItem', {
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    priceAtPurchase: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    }
});

OrderItem.belongsTo(Order, { foreignKey: 'orderId', onDelete: 'CASCADE' });
Order.hasMany(OrderItem, { foreignKey: 'orderId' });

OrderItem.belongsTo(Product, { foreignKey: 'productId' });
Product.hasMany(OrderItem, { foreignKey: 'productId' });

module.exports = OrderItem;
