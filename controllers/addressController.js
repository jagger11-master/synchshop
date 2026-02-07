const Address = require('../models/Address');

exports.createAddress = async (req, res) => {
    try {
        const { fullName, phone, street, city, state, postalCode, country } = req.body;
        const userId = req.user.id;

        const address = await Address.create({
            userId,
            fullName,
            phone,
            street,
            city,
            state,
            zipCode: postalCode, // Map postalCode to zipCode
            country
        });

        res.status(201).json(address);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAddresses = async (req, res) => {
    try {
        const userId = req.user.id;
        const addresses = await Address.findAll({ where: { userId } });
        res.json(addresses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const address = await Address.findOne({ where: { id, userId } });
        if (!address) {
            return res.status(404).json({ error: 'Address not found' });
        }

        await address.destroy();
        res.json({ message: 'Address deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
