const Product = require('../models/Product');
const ProductImage = require('../models/ProductImage');
const Category = require('../models/Category');

exports.createProduct = async (req, res) => {
    try {
        const { name, description, price, stock, categoryId, videoUrl } = req.body;

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'At least one product image is required' });
        }

        const category = await Category.findByPk(categoryId);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        const product = await Product.create({
            name,
            description,
            price,
            stock,
            categoryId,
            videoUrl
        });

        const images = req.files.map(file => ({
            productId: product.id,
            imageUrl: `/uploads/products/${file.filename}`
        }));

        await ProductImage.bulkCreate(images);

        const fullProduct = await Product.findByPk(product.id, {
            include: [ProductImage]
        });

        res.status(201).json(fullProduct);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getProducts = async (req, res) => {
    try {
        const products = await Product.findAll({
            include: [ProductImage, Category]
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByPk(id);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        await product.update(req.body);
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByPk(id);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        await product.destroy();
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
