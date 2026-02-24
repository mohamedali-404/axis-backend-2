const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    brandLogo: { type: String, default: '' },
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
