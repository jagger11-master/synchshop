require('dotenv').config();
// Set this ONLY for development to bypass SSL certificate issues
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const express = require('express');
const sequelize = require('./config/database');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5001;

sequelize.sync({ alter: true }).then(() => {
    app.listen(PORT, () => {
        console.log(`✅ Server is running on port ${PORT}`);
    });
}).catch(err => console.log('❌ DB Sync Error: ', err));
