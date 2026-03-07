const express = require('express');
const router = express.Router();
const { createOrder, getOrders, getOrderById, updateOrderStatus, deleteOrder, trackOrder, getPendingOrdersCount, addReceipt } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');

const orderLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 order creations per windowMs
    message: { message: 'Too many orders created from this IP, please try again after 15 minutes.' }
});

router.route('/').post(orderLimiter, createOrder).get(protect, getOrders);
router.route('/track').post(trackOrder);
router.route('/pending/count').get(protect, getPendingOrdersCount);
router.route('/:id').get(protect, getOrderById).put(protect, updateOrderStatus).delete(protect, deleteOrder);
router.route('/:id/receipt').put(addReceipt);

module.exports = router;
