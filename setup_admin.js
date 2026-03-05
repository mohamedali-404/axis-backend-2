require('dotenv').config({ override: true });
const mongoose = require('mongoose');
const crypto = require('crypto');
const User = require('./src/models/User');

const generateStrongPassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
    let password = '';
    for (let i = 0; i < 16; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // Ensures complexity
    password += 'A1!a_';
    return password;
};

const generateRandomUsername = () => {
    return 'admin_' + crypto.randomBytes(4).toString('hex');
};

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    try {
        await User.deleteMany({});
        console.log('All existing temporary users removed.');

        const username = generateRandomUsername();
        const password = generateStrongPassword();

        await User.create({ username, password });
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
