const User = require('../models/User');

const adminMiddleware = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id);

        if (!user || user.role !== 'admin') {
            return res.status(403).json({ error: "Access denied. Admin rights required." });
        }

        next();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = adminMiddleware;
