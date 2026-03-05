const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const Settings = require('./src/models/Settings');
    const Product = require('./src/models/Product');

    console.log("Fixing URL domains in the database for Production...");

    const s = await Settings.findOne();
    if (s) {
        if (s.brandLogo) s.brandLogo = s.brandLogo.replace(/http:\/\/localhost:5000/g, 'https://axis-backend-2.onrender.com');
        if (s.heroBanner) s.heroBanner = s.heroBanner.replace(/http:\/\/localhost:5000/g, 'https://axis-backend-2.onrender.com');
        if (s.socialImages) s.socialImages = s.socialImages.map(img => img.replace(/http:\/\/localhost:5000/g, 'https://axis-backend-2.onrender.com'));
        if (s.collectionCards) s.collectionCards.forEach(c => {
            if (c.image) c.image = c.image.replace(/http:\/\/localhost:5000/g, 'https://axis-backend-2.onrender.com');
        });
        if (s.sizeGuideImage) s.sizeGuideImage = s.sizeGuideImage.replace(/http:\/\/localhost:5000/g, 'https://axis-backend-2.onrender.com');
        await s.save();
    }

    const products = await Product.find({});
    let count = 0;
    for (const p of products) {
        let changed = false;
        if (p.images) {
            for (let i = 0; i < p.images.length; i++) {
                if (p.images[i] && p.images[i].includes('http://localhost:5000')) {
                    p.images[i] = p.images[i].replace(/http:\/\/localhost:5000/g, 'https://axis-backend-2.onrender.com');
                    changed = true;
                }
            }
        }
        if (changed) {
            await p.save();
            count++;
        }
    }

    console.log(`URL domain fixed in DB for Settings and ${count} Products.`);
    process.exit(0);
}).catch(err => {
    console.error("Error connecting to DB:", err);
    process.exit(1);
});
