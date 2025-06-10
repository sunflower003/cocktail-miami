const express = require('express');
const { body } = require('express-validator');
const {
    register,
    login,
    verifyEmail,
    resendVerification,
    getMe,
    logout
} = require('../controllers/authController');
const { auth } = require('../middleware/auth'); // Sửa import này
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

// Validation rules - Bỏ bớt validation phức tạp cho test
const registerValidation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    body('phone')
        .trim()
        .notEmpty()
        .withMessage('Please provide a phone number'),
    body('gender')
        .isIn(['male', 'female', 'other'])
        .withMessage('Gender must be male, female, or other')
];

const loginValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

const verifyEmailValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('verificationToken')
        .isLength({ min: 6, max: 6 })
        .isNumeric()
        .withMessage('Verification code must be 6 digits')
];

const resendVerificationValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email')
];

// Routes
router.post('/register', registerValidation, validateRequest, register);
router.post('/login', loginValidation, validateRequest, login);
router.post('/verify-email', verifyEmailValidation, validateRequest, verifyEmail);
router.post('/resend-verification', resendVerificationValidation, validateRequest, resendVerification);
router.get('/me', auth, getMe);
router.post('/logout', auth, logout);

module.exports = router;