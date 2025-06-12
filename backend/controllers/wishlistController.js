const Wishlist = require('../models/Wishlist.js');
const Product = require('../models/Product.js');

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private d
const getWishlist = async (req, res) => {
    try {
        const wishlistItems = await Wishlist.find({ userId: req.user.userId })
            .populate({
                path: 'productId',
                select: 'name description price images category slug stock isFeatured',
                populate: {
                    path: 'category',  // Thêm dòng này để populate category
                    select: 'name'
                }
            })
            .sort({ createdAt: -1 });

        // Filter out items where product was deleted
        const validItems = wishlistItems.filter(item => item.productId);

        res.json({
            success: true,
            data: validItems,
            count: validItems.length
        });

    } catch (error) {
        console.error('Get wishlist error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Add product to wishlist
// @route   POST /api/wishlist/:productId
// @access  Private
const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user.userId;

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check if already in wishlist
        const existingItem = await Wishlist.findOne({ userId, productId });
        if (existingItem) {
            return res.status(400).json({
                success: false,
                message: 'Product already in wishlist'
            });
        }

        // Add to wishlist
        const wishlistItem = new Wishlist({ userId, productId });
        await wishlistItem.save();

        // Populate the product data for response
        await wishlistItem.populate({
            path: 'productId',
            select: 'name description price images category slug stock isFeatured',
            populate: {
                path: 'category',  // Thêm dòng này
                select: 'name'
            }
        });

        res.status(201).json({
            success: true,
            message: 'Product added to wishlist',
            data: wishlistItem
        });

    } catch (error) {
        console.error('Add to wishlist error:', error);
        
        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Product already in wishlist'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user.userId;

        const result = await Wishlist.findOneAndDelete({ userId, productId });
        
        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Product not found in wishlist'
            });
        }

        res.json({
            success: true,
            message: 'Product removed from wishlist'
        });

    } catch (error) {
        console.error('Remove from wishlist error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Check if product is in user's wishlist
// @route   GET /api/wishlist/check/:productId
// @access  Private
const checkWishlistStatus = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user.userId;

        const exists = await Wishlist.exists({ userId, productId });

        res.json({
            success: true,
            data: {
                isInWishlist: !!exists
            }
        });

    } catch (error) {
        console.error('Check wishlist status error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Clear entire wishlist
// @route   DELETE /api/wishlist
// @access  Private
const clearWishlist = async (req, res) => {
    try {
        const userId = req.user.userId;

        const result = await Wishlist.deleteMany({ userId });

        res.json({
            success: true,
            message: `Removed ${result.deletedCount} items from wishlist`
        });

    } catch (error) {
        console.error('Clear wishlist error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    checkWishlistStatus,
    clearWishlist
};