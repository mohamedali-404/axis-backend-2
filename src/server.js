require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const { Server } = require('socket.io');

const uploadRoute = require('./routes/uploadRoute');
const productRoute = require('./routes/productRoute');
const orderRoute = require('./routes/orderRoute');
const settingsRoute = require('./routes/settingsRoute');
const authRoute = require('./routes/authRoute');
const couponRoute = require('./routes/couponRoute');

const path = require('path');

dotenv.config({ override: true });

// Warn if using fallback secrets in production
if (!process.env.JWT_SECRET) {
    console.warn('[SECURITY WARNING] JWT_SECRET is not set. Using insecure fallback. Set it in .env for production!');
}

const app = express();
const server = http.createServer(app);

// ─── CORS Configuration ───────────────────────────────────────────────────────
const corsOptions = {
    origin: "*", // مؤقت: السماح لأي دومين
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
};

// ─── Socket.IO Setup ──────────────────────────────────────────────────────────
const io = new Server(server, {
    cors: corsOptions,
    // Prevent memory leaks: limit max listeners per event
    pingTimeout: 60000,
    pingInterval: 25000,
});

// Attach io to app so controllers can access it
app.set('io', io);

io.on('connection', (socket) => {
    // Only log in development to reduce noise
    if (process.env.NODE_ENV !== 'production') {
        console.log(`[Socket] Connected: ${socket.id}`);
    }
    socket.on('disconnect', (reason) => {
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[Socket] Disconnected: ${socket.id} — ${reason}`);
        }
    });
});

// ─── Core Middleware ──────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(cors({
    origin: "*", // مؤقت: السماح لأي دومين
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

// Security Headers
app.use(helmet({
    crossOriginResourcePolicy: false,
}));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
// Strict limiter for auth endpoints (prevent brute-force)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { message: 'Too many login attempts. Please try again in 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// General API limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { message: 'Too many requests from this IP, please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.method === 'GET', // Don't rate-limit read-only requests
});

app.use('/api/auth', authLimiter);
app.use('/api/', apiLimiter);

// ─── Static Files ─────────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ─── Database & Server Start ──────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// ─── Server Start ─────────────────────────────────────────────────────
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/upload', uploadRoute);
app.use('/api/products', productRoute);
app.use('/api/orders', orderRoute);
app.use('/api/settings', settingsRoute);
app.use('/api/auth', authRoute);
app.use('/api/coupons', couponRoute);

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('[Error]', err.stack);
    res.status(err.status || 500).json({
        message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
    });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Server start logic moved to after DB connection
