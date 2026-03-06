const express = require('express');
const router = express.Router();
const {
    getProducts,
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');

// Search: query products by name (partial match)
router.get('/search', async (req, res) => {
    try {
        const q = req.query.q || '';
        if (!q.trim()) return res.json([]);
        const Product = require('../models/Product');
        const products = await Product.find({
            status: 'active',
            name: { $regex: q, $options: 'i' }
        }).select('-__v').limit(10).lean();
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Public: only active products
router.get('/', getProducts);

// Admin: all products including hidden
router.get('/admin/all', protect, getAllProducts);

// Shared
router.post('/', protect, createProduct);
router.route('/:id')
    .get(getProductById)
    .put(protect, updateProduct)
    .delete(protect, deleteProduct);

module.exports = router;
