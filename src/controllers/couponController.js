const Coupon = require('../models/Coupon');

exports.getCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find({});
        res.json(coupons);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createCoupon = async (req, res) => {
    try {
        const coupon = new Coupon(req.body);
        const createdCoupon = await coupon.save();
        res.status(201).json(createdCoupon);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (coupon) {
            await coupon.deleteOne();
            res.json({ message: 'Coupon removed' });
        } else {
            res.status(404).json({ message: 'Coupon not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.validateCoupon = async (req, res) => {
    try {
        const { code } = req.body;
        const coupon = await Coupon.findOne({ code, isActive: true });
        if (coupon && new Date(coupon.expirationDate) > new Date()) {
            res.json(coupon);
        } else {
            res.status(400).json({ message: 'Invalid or expired coupon' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
