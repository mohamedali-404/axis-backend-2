const mongoose = require('mongoose');
const Product = require('./src/models/Product');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    try {
        const res = await Product.updateMany(
            { name: { $regex: /long/i } },
            { $set: { sleeveType: 'Long' } }
        );
        console.log('Update result:', res);

        // Ensure others are Short just in case
        const res2 = await Product.updateMany(
            { sleeveType: { $exists: false } },
            { $set: { sleeveType: 'Short' } }
        );
        console.log('Update result 2:', res2);

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit();
    }
});
