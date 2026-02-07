require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const checkoutRoutes = require('./routes/checkoutRoutes');
const userRoutes = require('./routes/userRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const couponRoutes = require('./routes/couponRoutes');
const addressRoutes = require('./routes/addressRoutes');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use(apiLimiter);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/addresses', addressRoutes);

const PORT = process.env.PORT || 5001;

sequelize.sync({ alter: true }).then(() => {
    const server = app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(`Address Routes registered: ${!!addressRoutes}`);
    });
}).catch(err => {
    console.error('Database Sync Error REASON:', err);
    process.exit(1);
});

// Keep process alive check
setInterval(() => { }, 1000);

process.on('exit', (code) => {
    console.log(`Process exited with code: ${code}`);
});

process.on('SIGINT', () => {
    console.log('Received SIGINT. Press Control-D to exit.');
    process.exit();
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});