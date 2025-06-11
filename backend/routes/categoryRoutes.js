const express = require('express');
const { body } = require('express-validator');
const {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory
} = require('../controllers/categoryController');
const { auth, adminAuth } = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

// Validation
const categoryValidation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Category name must be between 2 and 100 characters'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description cannot exceed 500 characters')
];

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategory);

// Admin routes
router.post('/', auth, adminAuth, categoryValidation, validateRequest, createCategory);
router.put('/:id', auth, adminAuth, categoryValidation, validateRequest, updateCategory);
router.delete('/:id', auth, adminAuth, deleteCategory);

module.exports = router;