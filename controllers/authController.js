const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sendOTPEmail } = require('../services/emailService');

exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

        let user;
        try {
            user = await User.create({ username, email, password, otpCode: otp, otpExpires });
        } catch (dbError) {
            if (dbError.name === 'SequelizeValidationError' || dbError.name === 'SequelizeUniqueConstraintError') {
                return res.status(400).json({ error: dbError.errors.map(e => e.message).join(', ') });
            }
            return res.status(500).json({ error: "Database Error: " + dbError.message });
        }

        try {
            await sendOTPEmail(user.email, otp);
            res.status(201).json({ message: "OTP sent to your email!" });
        } catch (emailError) {
            return res.status(500).json({ error: "Email Error: " + emailError.message });
        }

    } catch (globalError) {
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

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        if (!user.isVerified) {
            return res.status(401).json({ error: "Please verify your account first" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

        user.otpCode = otp;
        user.otpExpires = otpExpires;
        await user.save();

        await sendOTPEmail(user.email, otp);
        res.json({ message: "Password reset OTP sent to your email!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user || user.otpCode !== otp || user.otpExpires < new Date()) {
            return res.status(400).json({ error: "Invalid or expired OTP" });
        }

        // Manual hash update since hooks only run on create or through user.save() if modified
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.otpCode = null;
        user.otpExpires = null;
        await user.save();

        res.json({ message: "Password reset successful! You can now login." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.adminRegister = async (req, res) => {
    try {
        const { username, email, password, adminSecret } = req.body;

        if (adminSecret !== process.env.ADMIN_SECRET_KEY) {
            return res.status(403).json({ error: "Unauthorized: Invalid Admin Secret Key" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

        const user = await User.create({
            username,
            email,
            password,
            role: 'admin',
            otpCode: otp,
            otpExpires
        });

        try {
            await sendOTPEmail(user.email, otp);
            res.status(201).json({ message: "Admin OTP sent to your email!" });
        } catch (emailError) {
            res.status(201).json({
                message: "Admin created but email failed. You can verify manually in database.",
                otpCode: otp
            });
        }
    } catch (error) {
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: error.errors.map(e => e.message).join(', ') + ". If you already have an account, try requesting a new OTP." });
        }
        res.status(500).json({ error: error.message });
    }
};

exports.resendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (user.isVerified) {
            return res.status(400).json({ error: "Email already verified" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

        user.otpCode = otp;
        user.otpExpires = otpExpires;
        await user.save();

        try {
            await sendOTPEmail(user.email, otp);
            res.json({ message: "A fresh OTP has been sent to your email!" });
        } catch (emailError) {
            return res.status(500).json({ error: "Email Error: " + emailError.message });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
