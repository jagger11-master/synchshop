const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendOTPEmail } = require('../services/emailService');

exports.register = async (req, res) => {
    console.log("🚀 [DEBUG] Signup request received for:", req.body.email);
    try {
        const { username, email, password } = req.body;

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        // 1. Create User in Database
        let user;
        try {
            user = await User.create({ username, email, password, otpCode: otp, otpExpires });
        } catch (dbError) {
            console.error("❌ DB ERROR:", dbError.message);
            if (dbError.name === 'SequelizeValidationError' || dbError.name === 'SequelizeUniqueConstraintError') {
                return res.status(400).json({ error: dbError.errors.map(e => e.message).join(', ') });
            }
            return res.status(500).json({ error: "Database Error: " + dbError.message });
        }

        // 2. Send OTP Email
        try {
            await sendOTPEmail(user.email, otp);
            res.status(201).json({ message: "OTP sent to your email!" });
        } catch (emailError) {
            console.error("❌ EMAIL ERROR:", emailError.message);
            return res.status(500).json({ error: "Email Error: " + emailError.message });
        }

    } catch (globalError) {
        console.error("❌ GLOBAL ERROR:", globalError.message);
        res.status(500).json({ error: globalError.message });
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user || user.otpCode !== otp || user.otpExpires < new Date()) {
            return res.status(400).json({ error: "Invalid or expired OTP" });
        }

        user.isVerified = true;
        user.otpCode = null;
        user.otpExpires = null;
        await user.save();

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ message: "Account verified!", token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.adminRegister = async (req, res) => {
    try {
        const { username, email, password, adminSecret } = req.body;
        console.log('--- Admin Registration Attempt ---');
        console.log('User:', username);
        console.log('Email:', email);

        if (adminSecret !== process.env.ADMIN_SECRET_KEY) {
            console.log('❌ Invalid Admin Secret');
            return res.status(403).json({ error: "Unauthorized: Invalid Admin Secret Key" });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        // Create Admin User
        const user = await User.create({
            username,
            email,
            password,
            role: 'admin',
            otpCode: otp,
            otpExpires
        });

        console.log('✅ Admin User Created in DB');

        // Send Email
        try {
            await sendOTPEmail(user.email, otp);
            console.log(`✅ OTP sent to ${user.email}`);
            res.status(201).json({ message: "Admin OTP sent to your email!" });
        } catch (emailError) {
            console.log('⚠️ Email failed, but user was created:', emailError.message);
            res.status(201).json({
                message: "Admin created but email failed. You can verify manually in database.",
                otpCode: otp // For testing purposes only
            });
        }
    } catch (error) {
        console.log('❌ Registration Error:', error.message);
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: error.errors.map(e => e.message).join(', ') + ". If you already have an account, try requesting a new OTP." });
        }
        res.status(500).json({ error: error.message });
    }
};

exports.resendOTP = async (req, res) => {
    console.log("🚀 [DEBUG] Resend OTP request for:", req.body.email);
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (user.isVerified) {
            return res.status(400).json({ error: "Email already verified" });
        }

        // Generate new OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        user.otpCode = otp;
        user.otpExpires = otpExpires;
        await user.save();

        // Send Email
        try {
            await sendOTPEmail(user.email, otp);
            res.json({ message: "A fresh OTP has been sent to your email!" });
        } catch (emailError) {
            console.error("❌ EMAIL ERROR:", emailError.message);
            return res.status(500).json({ error: "Email Error: " + emailError.message });
        }
    } catch (error) {
        console.error("❌ RESEND ERROR:", error.message);
        res.status(500).json({ error: error.message });
    }
};
