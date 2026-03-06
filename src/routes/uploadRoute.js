const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
    api_key: process.env.CLOUDINARY_API_KEY || '1234567890',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'abcdefg'
});

// Setup Cloudinary Storage for Multer
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'axis_uploads',
        allowed_formats: ['jpeg', 'jpg', 'png', 'webp', 'svg'],
        public_id: (req, file) => `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.post('/', protect, (req, res) => {
    upload.single('image')(req, res, function (err) {
        if (err) {
            return res.status(400).json({ message: err.message });
        }

        try {
            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }
            res.json({ url: req.file.path });
        } catch (error) {
            res.status(500).json({ message: 'Image upload failed', error: error.message });
        }
    });
});

router.post('/receipt', (req, res) => {
    upload.single('image')(req, res, function (err) {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }
            res.json({ url: req.file.path });
        } catch (error) {
            res.status(500).json({ message: 'Image upload failed', error: error.message });
        }
    });
});

module.exports = router;
