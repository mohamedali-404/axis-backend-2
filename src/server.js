const express = require('express');
const mongoose = require('mongoose');
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

dotenv.config();

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Attach io to app so controllers can access it
app.set('io', io);

io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);
    socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id);
    });
});

app.use(express.json());
app.use(cors());

// Security Headers
app.use(helmet({
    crossOriginResourcePolicy: false,
}));

// Rate Limiting (100 requests per 15 mins per IP for APIs)
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', apiLimiter);

// Expose the raw uploads folder natively for development image storage
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/axisDB').then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

app.use('/api/upload', uploadRoute);
app.use('/api/products', productRoute);
app.use('/api/orders', orderRoute);
app.use('/api/settings', settingsRoute);
app.use('/api/auth', authRoute);
app.use('/api/coupons', couponRoute);

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
