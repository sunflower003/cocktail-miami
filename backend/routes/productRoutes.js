const express = require('express');
const { body } = require('express-validator');
const {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');
const { auth, adminAuth } = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');
const { uploadProductImages, uploadBackgroundImages } = require('../config/cloudinary');

const router = express.Router();

// Validation
const productValidation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 200 })
        .withMessage('Product name must be between 2 and 200 characters'),
    body('description')
        .trim()
        .isLength({ min: 10, max: 2000 })
        .withMessage('Description must be between 10 and 2000 characters'),
    body('price')
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),
    body('company')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Company name must be between 2 and 100 characters'),
    body('category')
        .isMongoId()
        .withMessage('Invalid category ID'),
    body('stock')
        .isInt({ min: 0 })
        .withMessage('Stock must be a non-negative integer'),
    body('country')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Country must be between 2 and 100 characters')
];

// Setup multer for file uploads
const uploadFiles = (req, res, next) => {
    console.log('🔧 Setting up file upload middleware...');
    
    const upload = uploadProductImages.fields([
        { name: 'images', maxCount: 10 },
        { name: 'backgroundImages', maxCount: 5 }
    ]);
    
    upload(req, res, (err) => {
        if (err) {
            console.error('❌ Upload error:', err);
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }
        
        console.log('✅ Files uploaded to multer');
        console.log('📁 req.files:', req.files);
        next();
    });
};

// Public routes
router.get('/', getProducts);
router.get('/:id', getProduct);

// Admin routes
router.post('/', auth, adminAuth, uploadFiles, productValidation, validateRequest, createProduct);
router.put('/:id', auth, adminAuth, uploadFiles, updateProduct);
router.delete('/:id', auth, adminAuth, deleteProduct);

module.exports = router;