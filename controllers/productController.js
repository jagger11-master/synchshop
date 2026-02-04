const Product = require('../models/Product');
const ProductImage = require('../models/ProductImage');
const Category = require('../models/Category');
const ProductVariant = require('../models/ProductVariant');

exports.createProduct = async (req, res) => {
    try {
        const { name, description, price, stock, categoryId, videoUrl, variants } = req.body;

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

        // Add Variants if provided
        if (variants && Array.isArray(variants)) {
            const variantData = variants.map(v => ({
                productId: product.id,
                ...v
            }));
            await ProductVariant.bulkCreate(variantData);
        }

        const fullProduct = await Product.findByPk(product.id, {
            include: [ProductImage, ProductVariant]
        });

        res.status(201).json(fullProduct);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const { Op } = require('sequelize');

exports.getProducts = async (req, res) => {
    try {
        const { search, categoryId, minPrice, maxPrice, page = 1, limit = 10 } = req.query;
        let where = {};

        if (search) {
            where.name = { [Op.iLike]: `%${search}%` };
        }

        if (categoryId) {
            where.categoryId = categoryId;
        }

        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
            if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
        }

        const offset = (page - 1) * limit;

        const { count, rows: products } = await Product.findAndCountAll({
            where,
            include: [ProductImage, Category, ProductVariant],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json({
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            products
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getRelatedProducts = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByPk(id);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const related = await Product.findAll({
            where: {
                categoryId: product.categoryId,
                id: { [Op.ne]: id }
            },
            limit: 4,
            include: [ProductImage]
        });

        res.json(related);
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

exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByPk(id, {
            include: [ProductImage, Category, ProductVariant]
        });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

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
