const Product = require('../models/Product');
const mongoose = require('mongoose');

// Public endpoint: only return active products
exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find({ status: 'active' }).select('-__v').lean();
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Admin endpoint (used internally via admin page which has token)
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({}).select('-__v').lean();
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getProductById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ message: 'Product not found' });
        }
        const product = await Product.findById(req.params.id).select('-__v').lean();
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const { name, price, stock, descriptionEn, descriptionAr } = req.body;
        if (!name || price === undefined || stock === undefined || !descriptionEn || !descriptionAr) {
            return res.status(400).json({ message: 'Missing required fields: name, price, stock, descriptionEn, descriptionAr' });
        }
        if (isNaN(price) || price < 0) {
            return res.status(400).json({ message: 'Price must be a non-negative number' });
        }
        if (isNaN(stock) || stock < 0) {
            return res.status(400).json({ message: 'Stock must be a non-negative number' });
        }

        const product = new Product(req.body);
        const createdProduct = await product.save();

        // Real-time: notify all clients of new product
        const io = req.app.get('io');
        if (io) {
            io.emit('product_created', createdProduct);
        }

        res.status(201).json(createdProduct);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ message: 'Product not found' });
        }
        const product = await Product.findById(req.params.id);
        if (product) {
            const { _id, createdAt, updatedAt, __v, ...updateData } = req.body;

            // Validate price/stock if provided
            if (updateData.price !== undefined && (isNaN(updateData.price) || updateData.price < 0)) {
                return res.status(400).json({ message: 'Price must be a non-negative number' });
            }
            if (updateData.stock !== undefined && (isNaN(updateData.stock) || updateData.stock < 0)) {
                return res.status(400).json({ message: 'Stock must be a non-negative number' });
            }

            Object.assign(product, updateData);
            const updatedProduct = await product.save();

            // Real-time: notify all clients of product update
            const io = req.app.get('io');
            if (io) {
                // If product is hidden, tell clients to remove it from listings
                if (updatedProduct.status === 'hidden') {
                    io.emit('product_deleted', { id: updatedProduct._id });
                } else {
                    io.emit('product_updated', updatedProduct);
                }
            }

            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ message: 'Product not found' });
        }
        const product = await Product.findById(req.params.id);
        if (product) {
            await product.deleteOne();

            // Real-time: notify all clients that product is gone
            const io = req.app.get('io');
            if (io) {
                io.emit('product_deleted', { id: req.params.id });
            }

            res.json({ message: 'Product removed' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
