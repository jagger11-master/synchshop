const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Order = sequelize.define('Order', {
    totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'paid', 'failed', 'shipped', 'delivered'),
        defaultValue: 'pending'
    },
    paymentReference: {
        type: DataTypes.STRING,
        allowNull: true
    },
    paymentMethod: {
        type: DataTypes.STRING,
        allowNull: true
    },
    accountNumber: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

Order.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
User.hasMany(Order, { foreignKey: 'userId' });

module.exports = Order;
