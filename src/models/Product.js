const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    descriptionEn: { type: String, required: true },
    descriptionAr: { type: String, required: true },
    price: { type: Number, required: true },
    discountPrice: { type: Number },
    stock: { type: Number, required: true, default: 0 },
    images: [{ type: String }],
    sizes: [{ type: String }],
    sleeveType: { type: String, enum: ['Short', 'Long'], default: 'Short' },
    status: { type: String, enum: ['active', 'hidden'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
