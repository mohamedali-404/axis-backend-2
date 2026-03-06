const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String, required: true },
    notes: { type: String },
    paymentMethod: { type: String, default: 'Cash on Delivery' }, // or Mobile Wallet
    vodafoneCashNumber: { type: String },
    receiptImage: { type: String },
    items: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
            name: String,
            price: Number,
            quantity: Number,
            size: String,
            color: String,
            image: String
        }
    ],
    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, required: true },
    total: { type: Number, required: true },
    discountApplied: { type: Number, default: 0 },
    status: { type: String, enum: ['Pending', 'Placed', 'Payment Review', 'Confirmed', 'Preparing', 'Shipped', 'Delivered'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
