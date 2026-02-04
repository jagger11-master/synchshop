const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Address = sequelize.define('Address', {
    street: {
        type: DataTypes.STRING,
        allowNull: false
    },
    city: {
        type: DataTypes.STRING,
        allowNull: false
    },
    state: {
        type: DataTypes.STRING,
        allowNull: true
    },
    zipCode: {
        type: DataTypes.STRING,
        allowNull: false
    },
    country: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Tanzania'
    },
    isDefault: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});

Address.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
User.hasMany(Address, { foreignKey: 'userId' });

module.exports = Address;
