const Order = require('../models/Order');
const Product = require('../models/Product');
const Settings = require('../models/Settings');
const mongoose = require('mongoose');

exports.createOrder = async (req, res) => {
    try {
        const { items, city, customerName, email, phone, address, notes, paymentMethod, vodafoneCashNumber, discountApplied } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'No items in order' });
        }

        let calculatedSubtotal = 0;

        // Ensure items have actual DB prices
        const validatedItems = await Promise.all(items.map(async (item) => {
            const product = await Product.findById(item.product);
            if (!product) throw new Error(`Product not found: ${item.name}`);

            const price = product.discountPrice || product.price;
            calculatedSubtotal += price * item.quantity;

            return {
                product: product._id,
                name: product.name,
                price: price,
                quantity: item.quantity,
                size: item.size,
                image: product.images && product.images.length > 0 ? product.images[0] : item.image
            };
        }));

        // Ensure shipping cost is from DB settings based on city
        let shippingCost = 0;
        const settings = await Settings.findOne({});
        if (settings && settings.shippingRates) {
            const cityRate = settings.shippingRates.find(r => r.city.toLowerCase() === city.toLowerCase());
            if (cityRate) {
                shippingCost = cityRate.cost;
            } else if (req.body.shippingCost) {
                // Strict validation: if city is not found in DB, fallback to 0. We will NOT trust the client's arbitrary shipping cost.
                shippingCost = 0;
            }
        }

        // Prevent discount tampering (cap at subtotal)
        const validDiscount = Math.max(0, Math.min(Number(discountApplied) || 0, calculatedSubtotal));
        const calculatedTotal = calculatedSubtotal - validDiscount + shippingCost;

        const orderData = {
            customerName, email, phone, city, address, notes, paymentMethod, vodafoneCashNumber,
            items: validatedItems,
            subtotal: calculatedSubtotal,
            shippingCost: shippingCost,
            discountApplied: validDiscount,
            total: calculatedTotal
        };

        const order = new Order(orderData);
        const createdOrder = await order.save();

        // Emit real-time event to admin panels
        const io = req.app.get('io');
        if (io) {
            io.emit('new_order', createdOrder);
        }

        res.status(201).json(createdOrder);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find({}).sort({ createdAt: -1 });
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
        const order = await Order.findById(req.params.id);
        if (order) {
            res.json(order);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ message: 'Order not found' });
        }
        const order = await Order.findById(req.params.id);
        if (order) {
            order.status = req.body.status || order.status;
            const updatedOrder = await order.save();

            // Emit real-time event to all clients
            const io = req.app.get('io');
            if (io) {
                io.emit('order_updated', updatedOrder);
            }

            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
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
        if (order) {
            // Emit real-time deletion event
            const io = req.app.get('io');
            if (io) {
                io.emit('order_deleted', { id: req.params.id });
            }
            res.json({ message: 'Order removed successfully' });
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
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
        const order = await Order.findOne({ _id: orderId, phone: phone });
        if (order) {
            res.json(order);
        } else {
            res.status(404).json({ message: 'Order not found or invalid phone number' });
        }
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
