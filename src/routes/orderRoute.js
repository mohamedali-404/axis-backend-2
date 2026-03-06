const express = require('express');
const router = express.Router();
const { createOrder, getOrders, getOrderById, updateOrderStatus, deleteOrder, trackOrder, getPendingOrdersCount, addReceipt } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(createOrder).get(protect, getOrders);
router.route('/track').post(trackOrder);
router.route('/pending/count').get(protect, getPendingOrdersCount);
router.route('/:id').get(protect, getOrderById).put(protect, updateOrderStatus).delete(protect, deleteOrder);
router.route('/:id/receipt').put(addReceipt);

module.exports = router;
