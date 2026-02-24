const express = require('express');
const router = express.Router();
const { getCoupons, createCoupon, deleteCoupon, validateCoupon } = require('../controllers/couponController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getCoupons).post(protect, createCoupon);
router.route('/:id').delete(protect, deleteCoupon);
router.post('/validate', validateCoupon);

module.exports = router;
