const express = require('express');
const router = express.Router();
const { login, registerAdmin, forgotPassword, updatePassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', login);
router.post('/register', registerAdmin);
router.post('/forgot-password', forgotPassword);
router.post('/change-password', protect, updatePassword);

module.exports = router;
