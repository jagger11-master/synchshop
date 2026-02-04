const User = require('../models/User');

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password', 'otpCode', 'otpExpires'] }
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { username, email } = req.body;
        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (username) user.username = username;
        if (email) user.email = email;

        await user.save();

        const updatedUser = await User.findByPk(user.id, {
            attributes: { exclude: ['password', 'otpCode', 'otpExpires'] }
        });

        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
