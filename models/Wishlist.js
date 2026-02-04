const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Product = require('./Product');
const User = require('./User');

const Wishlist = sequelize.define('Wishlist', {});

Wishlist.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
User.hasMany(Wishlist, { foreignKey: 'userId' });

Wishlist.belongsTo(Product, { foreignKey: 'productId', onDelete: 'CASCADE' });
Product.hasMany(Wishlist, { foreignKey: 'productId' });

module.exports = Wishlist;
