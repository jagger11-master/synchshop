const CartItem = require('../models/CartItem');
const Product = require('../models/Product');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const sequelize = require('../config/database');

exports.processCheckout = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { paymentMethod, accountNumber, pin } = req.body;
        const userId = req.user.id;

        // 1. Validate Payment Simulation (Realistic feel)
        if (!paymentMethod || !accountNumber || !pin) {
            return res.status(400).json({ error: 'Payment method, Account number, and PIN are required' });
        }

        // In Sandbox, we "process" the transaction if all fields are provided
        // This simulates talking to a bank or mobile money API

        // 2. Get Cart Items
        const cartItems = await CartItem.findAll({
            where: { userId },
            include: [Product]
        });

        if (cartItems.length === 0) {
            return res.status(400).json({ error: 'Your cart is empty' });
        }

        // 3. Calculate Total and Verify Stock
        let totalAmount = 0;
        for (const item of cartItems) {
            if (item.Product.stock < item.quantity) {
                await transaction.rollback();
                return res.status(400).json({ error: `Not enough stock for ${item.Product.name}` });
            }
            totalAmount += item.Product.price * item.quantity;
        }

        // 4. Create Order
        const order = await Order.create({
            userId,
            totalAmount,
            status: 'paid', // Success simulation
            paymentReference: 'PAY-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            paymentMethod,
            accountNumber
        }, { transaction });

        // 5. Create Order Items and Update Stock
        for (const item of cartItems) {
            await OrderItem.create({
                orderId: order.id,
                productId: item.productId,
                quantity: item.quantity,
                priceAtPurchase: item.Product.price
            }, { transaction });

            // Decrease Stock
            await item.Product.update({
                stock: item.Product.stock - item.quantity
            }, { transaction });
        }

        // 6. Clear Cart
        await CartItem.destroy({ where: { userId }, transaction });

        await transaction.commit();

        res.status(201).json({
            message: 'Transaction successfully processed!',
            orderId: order.id,
            total: totalAmount,
            reference: order.paymentReference
        });

    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ error: error.message });
    }
};

exports.getOrderHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await Order.findAll({
            where: { userId },
            include: [{
                model: OrderItem,
                include: [Product]
            }],
            order: [['createdAt', 'DESC']]
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
