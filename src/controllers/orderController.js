const Order = require('../models/Order');
const Product = require('../models/Product');
const Settings = require('../models/Settings');
const mongoose = require('mongoose');

const ALLOWED_STATUSES = ['Pending', 'Shipped', 'Delivered'];

exports.createOrder = async (req, res) => {
    try {
        const {
            items, city, customerName, email, phone,
            address, notes, paymentMethod, vodafoneCashNumber, discountApplied
        } = req.body;

        // ── Basic Validation ──────────────────────────────────────────────────
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'No items in order' });
        }
        if (!city || !customerName || !phone || !address || !paymentMethod) {
            return res.status(400).json({ message: 'Missing required order fields' });
        }

        // ── Fetch all products in ONE query (prevent N+1) ─────────────────────
        const productIds = items.map(item => item.product);
        const invalidIds = productIds.filter(id => !mongoose.Types.ObjectId.isValid(id));
        if (invalidIds.length > 0) {
            return res.status(400).json({ message: `Invalid product IDs: ${invalidIds.join(', ')}` });
        }

        const products = await Product.find({ _id: { $in: productIds }, status: 'active' }).lean();
        const productMap = {};
        products.forEach(p => { productMap[p._id.toString()] = p; });

        // ── Validate & Calculate ──────────────────────────────────────────────
        let calculatedSubtotal = 0;
        const validatedItems = items.map(item => {
            const product = productMap[item.product?.toString()];
            if (!product) throw new Error(`Product not found or unavailable: ${item.name}`);
            if (!item.quantity || item.quantity < 1) throw new Error(`Invalid quantity for: ${product.name}`);
            if (!item.size) throw new Error(`Size not selected for: ${product.name}`);

            const price = product.discountPrice || product.price;
            calculatedSubtotal += price * item.quantity;

            return {
                product: product._id,
                name: product.name,
                price: price,
                quantity: item.quantity,
                size: item.size,
                image: product.images?.[0] || ''
            };
        });

        // ── Shipping from DB only (no client trust) ───────────────────────────
        let shippingCost = 0;
        const settings = await Settings.findOne({}).lean();
        if (settings?.shippingRates) {
            const cityRate = settings.shippingRates.find(
                r => r.city.toLowerCase() === city.toLowerCase()
            );
            if (cityRate) shippingCost = cityRate.cost;
        }

        // ── Discount cap (prevent tampering) ──────────────────────────────────
        const validDiscount = Math.max(0, Math.min(Number(discountApplied) || 0, calculatedSubtotal));
        const calculatedTotal = calculatedSubtotal - validDiscount + shippingCost;

        const order = new Order({
            customerName, email, phone, city, address, notes,
            paymentMethod, vodafoneCashNumber,
            items: validatedItems,
            subtotal: calculatedSubtotal,
            shippingCost,
            discountApplied: validDiscount,
            total: calculatedTotal
        });

        const createdOrder = await order.save();

        // Real-time event
        const io = req.app.get('io');
        if (io) io.emit('new_order', createdOrder);

        res.status(201).json(createdOrder);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find({}).sort({ createdAt: -1 }).lean();
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ message: 'Order not found' });
        }
        const order = await Order.findById(req.params.id).lean();
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;

        // Validate status value
        if (!status || !ALLOWED_STATUSES.includes(status)) {
            return res.status(400).json({
                message: `Invalid status. Must be one of: ${ALLOWED_STATUSES.join(', ')}`
            });
        }
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!updatedOrder) return res.status(404).json({ message: 'Order not found' });

        const io = req.app.get('io');
        if (io) io.emit('order_updated', updatedOrder);

        res.json(updatedOrder);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteOrder = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ message: 'Order not found' });
        }
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        const io = req.app.get('io');
        if (io) io.emit('order_deleted', { id: req.params.id });

        res.json({ message: 'Order removed successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.trackOrder = async (req, res) => {
    try {
        const { orderId, phone } = req.body;
        if (typeof phone !== 'string' || typeof orderId !== 'string') {
            return res.status(400).json({ message: 'Invalid input format' });
        }
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(404).json({ message: 'Order not found or invalid phone number' });
        }
        const order = await Order.findOne({ _id: orderId, phone }).lean();
        if (!order) return res.status(404).json({ message: 'Order not found or invalid phone number' });
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getPendingOrdersCount = async (req, res) => {
    try {
        const count = await Order.countDocuments({ status: 'Pending' });
        res.json({ count });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
