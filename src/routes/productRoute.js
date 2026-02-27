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
