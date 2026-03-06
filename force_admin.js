require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const crypto = require('crypto');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    try {
        await User.deleteMany({});
        console.log('Deleted old temporary users.');

        const username = 'admin';
        const password = 'AxisPassword123!';

        await User.create({ username, password, email: 'admin@axis-store.com' });

        console.log('####################################');
        console.log('--- NEW STRONG ADMIN CREDENTIALS ---');
        console.log('Username: ' + username);
        console.log('Password: ' + password);
        console.log('####################################');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
});
