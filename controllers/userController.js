const User = require('../models/User');
const Address = require('../models/Address');

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

exports.getAddresses = async (req, res) => {
    try {
        const addresses = await Address.findAll({ where: { userId: req.user.id } });
        res.json(addresses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.addAddress = async (req, res) => {
    try {
        const { street, city, state, zipCode, country, isDefault } = req.body;

        if (isDefault) {
            await Address.update({ isDefault: false }, { where: { userId: req.user.id } });
        }

        const address = await Address.create({
            userId: req.user.id,
            street,
            city,
            state,
            zipCode,
            country,
            isDefault
        });

        res.status(201).json(address);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const address = await Address.findOne({ where: { id, userId: req.user.id } });

        if (!address) {
            return res.status(404).json({ error: 'Address not found' });
        }

        await address.destroy();
        res.json({ message: 'Address deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
