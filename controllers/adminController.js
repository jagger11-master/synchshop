const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');
const User = require('../models/User');

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
            include: [
                { model: User, attributes: ['username', 'email'] },
                { model: OrderItem, include: [Product] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateStockManual = async (req, res) => {
    try {
        const { productId, newStock } = req.body;
        const product = await Product.findByPk(productId);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        product.stock = newStock;
        await product.save();

        res.json({ message: 'Stock updated successfully', product });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        const order = await Order.findByPk(orderId);

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        order.status = status;
        await order.save();

        res.json({ message: 'Order status updated', order });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        const totalRevenue = await Order.sum('totalAmount', { where: { status: 'paid' } }) || 0;
        const totalOrders = await Order.count();
        const pendingOrders = await Order.count({ where: { status: 'pending' } });
        const totalUsers = await User.count({ where: { role: 'user' } });
        const totalProducts = await Product.count();

        // Recent orders
        const recentOrders = await Order.findAll({
            limit: 5,
            order: [['createdAt', 'DESC']],
            include: [{ model: User, attributes: ['username'] }]
        });

        res.json({
            stats: {
                totalRevenue,
                totalOrders,
                pendingOrders,
                totalUsers,
                totalProducts
            },
            recentOrders
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password', 'otpCode', 'otpExpires'] },
            order: [['createdAt', 'DESC']]
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAnalytics = async (req, res) => {
    try {
        const orders = await Order.findAll({
            where: { status: 'paid' },
            attributes: ['totalAmount', 'createdAt'],
            order: [['createdAt', 'ASC']]
        });

        // Group by month in JS
        const monthlyData = {};
        orders.forEach(order => {
            const date = new Date(order.createdAt);
            const monthYear = date.toLocaleString('default', { month: 'short', year: '2-digit' });
            monthlyData[monthYear] = (monthlyData[monthYear] || 0) + parseFloat(order.totalAmount);
        });

        const chartData = Object.keys(monthlyData).map(month => ({
            name: month,
            revenue: monthlyData[month]
        }));

        res.json(chartData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
