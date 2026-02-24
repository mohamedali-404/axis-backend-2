const express = require('express');
const router = express.Router();
const { createOrder, getOrders, getOrderById, updateOrderStatus, deleteOrder, trackOrder, getPendingOrdersCount } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(createOrder).get(protect, getOrders);
router.route('/track').post(trackOrder);
router.route('/pending/count').get(protect, getPendingOrdersCount);
router.route('/:id').get(protect, getOrderById).put(protect, updateOrderStatus).delete(protect, deleteOrder);

module.exports = router;
