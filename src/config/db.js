const mongoose = require("mongoose");

const connectDB = async () => {
    // Support both MONGODB_URI and MONGO_URI for compatibility
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

    if (!uri) {
        console.error('[DB] ERROR: No MongoDB URI found. Set MONGODB_URI in your .env file.');
        process.exit(1);
    }

    try {
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 10000, // 10 seconds timeout
            socketTimeoutMS: 45000,
        });
        console.log('[DB] MongoDB Connected successfully.');
    } catch (err) {
        console.error('[DB] MongoDB connection FAILED:', err.message);
        process.exit(1);
    }
};

// Handle connection events after initial connect
mongoose.connection.on('disconnected', () => {
    console.warn('[DB] MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
    console.log('[DB] MongoDB reconnected.');
});

mongoose.connection.on('error', (err) => {
    console.error('[DB] MongoDB error:', err.message);
});

module.exports = connectDB;
