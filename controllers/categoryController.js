const Category = require('../models/Category');

exports.createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const category = await Category.create({ name, description });
        res.status(201).json(category);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'Category name already exists' });
        }
        res.status(500).json({ error: error.message });
    }
};

exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.findAll();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const category = await Category.findByPk(id);

        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        category.name = name || category.name;
        category.description = description || category.description;
        await category.save();

        res.json(category);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findByPk(id);

        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        await category.destroy();
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
