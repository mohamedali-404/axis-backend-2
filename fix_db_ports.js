const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://axisAdmin:axisAdmin123456@cluster0.zg7v3ah.mongodb.net/axisDB?retryWrites=true&w=majority').then(async () => {
    const Settings = require('./src/models/Settings');
    const Product = require('./src/models/Product');

    console.log("Fixing URL ports in the database...");

    const s = await Settings.findOne();
    if (s) {
        if (s.brandLogo) s.brandLogo = s.brandLogo.replace(/:5001/g, ':5000');
        if (s.heroBanner) s.heroBanner = s.heroBanner.replace(/:5001/g, ':5000');
        if (s.socialImages) s.socialImages = s.socialImages.map(img => img.replace(/:5001/g, ':5000'));
        if (s.collectionCards) s.collectionCards.forEach(c => {
            if (c.image) c.image = c.image.replace(/:5001/g, ':5000');
        });
        if (s.sizeGuideImage) s.sizeGuideImage = s.sizeGuideImage.replace(/:5001/g, ':5000');
        await s.save();
    }

    const products = await Product.find({});
    for (const p of products) {
        let changed = false;
        if (p.images) {
            for (let i = 0; i < p.images.length; i++) {
                if (p.images[i] && p.images[i].includes(':5001')) {
                    p.images[i] = p.images[i].replace(/:5001/g, ':5000');
                    changed = true;
                }
            }
        }
        if (changed) await p.save();
    }

    console.log("Port fixed in DB.");
    process.exit(0);
});
