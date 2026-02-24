const User = require('../models/User');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecret123', {
        expiresIn: '30d',
    });
};

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER || 'axisfitwear111@gmail.com',
            pass: process.env.EMAIL_PASS || ''
        }
    });

    const mailOptions = {
        from: '"AXIS Store Admin" <axisfitwear111@gmail.com>',
        to: options.email,
        subject: options.subject,
        html: options.message
    };

    await transporter.sendMail(mailOptions);
};

const login = async (req, res) => {
    try {
        let { username, password } = req.body;

        if (typeof username !== 'string' || typeof password !== 'string') {
            return res.status(400).json({ message: 'Invalid input format' });
        }

        const user = await User.findOne({ username });
        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                username: user.username,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const registerAdmin = async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        if (userCount > 0) {
            return res.status(400).json({ message: 'Admin already exists' });
        }
        let { username, password } = req.body;

        if (typeof username !== 'string' || typeof password !== 'string') {
            return res.status(400).json({ message: 'Invalid input format' });
        }

        const user = await User.create({ username, password });
        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email || typeof email !== 'string') {
            return res.status(400).json({ message: 'Please provide a valid email address' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            // Do not reveal that the email doesn't exist for security
            return res.json({ message: 'If the email exists, a temporary password has been sent.' });
        }

        // Generate strong temporary password
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
        let tempPassword = '';
        for (let i = 0; i < 16; i++) {
            tempPassword += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        tempPassword += 'A1!a_';

        const message = `
            <h2>AXIS Admin Password Reset</h2>
            <p>You have requested a new temporary password for your AXIS Admin account.</p>
            <p><strong>Your Temporary Password:</strong> <code style="padding: 5px; background: #eee; border-radius: 4px;">${tempPassword}</code></p>
            <p>Please log in immediately with this password and change it from the settings panel for security purposes.</p>
        `;

        try {
            await sendEmail({
                email: user.email,
                subject: '[AXIS Admin] إعاده تعيين كلمة السر (Temporary Password)',
                message
            });
            // Update password in DB ONLY after successful send
            user.password = tempPassword;
            await user.save();
            res.json({ message: 'If the email exists, a temporary password has been sent.' });
        } catch (err) {
            console.error('Email could not be sent', err);
            res.status(500).json({ message: 'Email could not be sent. Please check SMTP configuration.' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id);

        if (user && (await user.matchPassword(currentPassword))) {
            // check new password strength
            if (!newPassword || newPassword.length < 12) {
                return res.status(400).json({ message: 'New password must be at least 12 characters long.' });
            }
            user.password = newPassword;
            await user.save();
            res.json({ message: 'Password updated successfully' });
        } else {
            res.status(401).json({ message: 'Invalid current password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { login, registerAdmin, forgotPassword, updatePassword };
