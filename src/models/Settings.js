const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    brandLogo: { type: String, default: '' },
    announcementText: { type: String, default: 'Free shipping on orders over $50 ✦ New arrivals every week ✦ Premium quality sportswear' },
    heroHeadline: { type: String, default: 'Train Hard. Look Sharp.' },
    heroBanner: { type: String, default: '' },
    subHeadline: { type: String, default: 'Minimal design. Maximum performance.' },
    socialLinks: {
        facebook: { type: String, default: '' },
        instagram: { type: String, default: '' },
        tiktok: { type: String, default: '' }
    },
    socialSectionTitle: { type: String, default: 'Follow The Movement' },
    socialSectionText: { type: String, default: 'Join our community on Instagram and TikTok. Tag @AXIS to be featured.' },
    socialImages: [{ type: String }],
    collectionSectionTitle: { type: String, default: 'Shop by Collection' },
    collectionCards: [{
        title: { type: String, default: '' },
        image: { type: String, default: '' },
        link: { type: String, default: '/shop' }
    }],
    themeSettings: {
        accentColor: { type: String, default: '#000000' },
        backgroundColor: { type: String, default: '#ffffff' },
        secondaryColor: { type: String, default: '#f7f7f7' }
    },
    aboutText: { type: String, default: 'We are AXIS. We believe in minimal design and maximum performance.' },
    materialsAndCare: { type: String, default: '90% Polyester, 10% Elastane\nMoisture-wicking fabric\nMachine wash cold, gentle cycle\nDo not bleach or tumble dry' },
    shippingInfo: { type: String, default: 'Standard delivery: 3–5 business days\nExpress delivery: 1–2 business days\nFree shipping on orders over 500 ج.م\nOrders placed before 2 PM ship same day' },
    returnsInfo: { type: String, default: 'Free returns within 30 days of purchase\nItems must be unworn and in original packaging\nExchanges available for different sizes\nContact support to initiate a return' },
    whatsappNumber: { type: String, default: '201140892554' },
    sizeGuideImage: { type: String, default: '' },
    contactInfo: {
        email: { type: String, default: 'support@axis-store.com' },
        phone: { type: String, default: '+20 100 000 0000' },
        address: { type: String, default: 'Cairo, Egypt' }
    },
    paymentMethods: {
        cashOnDelivery: { type: Boolean, default: true },
        eWallet: { type: Boolean, default: true },
        eWalletNumber: { type: String, default: '01000000000' },
        eWalletName: { type: String, default: 'E-Wallet / Cash' }
    },
    shippingRates: [{
        city: { type: String },
        cost: { type: Number }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
