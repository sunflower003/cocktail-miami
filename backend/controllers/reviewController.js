const mongoose = require('mongoose'); // ✅ THÊM IMPORT NÀY
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        const { page = 1, limit = 10, sort = 'newest' } = req.query;

        // Validate product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Sort options
        let sortOption = { createdAt: -1 }; // newest first
        if (sort === 'oldest') sortOption = { createdAt: 1 };
        if (sort === 'highest') sortOption = { rating: -1, createdAt: -1 };
        if (sort === 'lowest') sortOption = { rating: 1, createdAt: -1 };

        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get reviews
        const reviews = await Review.find({ 
            product: productId, 
            isHidden: false 
        })
        .populate('user', 'name')
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit));

        // Get total count
        const total = await Review.countDocuments({ 
            product: productId, 
            isHidden: false 
        });

        // ✅ FIX AGGREGATION - SỬ DỤNG ĐÚNG CÁCH
        const stats = await Review.aggregate([
            { 
                $match: { 
                    product: new mongoose.Types.ObjectId(productId),
                    isHidden: false
                }
            },
            {
                $group: {
                    _id: null,
                    totalReviews: { $sum: 1 },
                    averageRating: { $avg: '$rating' },
                    ratingCounts: {
                        $push: '$rating'
                    }
                }
            }
        ]);

        let reviewStats = {
            totalReviews: 0,
            averageRating: 0,
            ratingDistribution: [0, 0, 0, 0, 0] // [1-star, 2-star, 3-star, 4-star, 5-star]
        };

        if (stats.length > 0) {
            const stat = stats[0];
            reviewStats.totalReviews = stat.totalReviews;
            reviewStats.averageRating = Math.round(stat.averageRating * 10) / 10;
            
            // ✅ TÍNH RATING DISTRIBUTION ĐÚNG CÁCH
            stat.ratingCounts.forEach(rating => {
                reviewStats.ratingDistribution[rating - 1]++;
            });
        }

        res.json({
            success: true,
            data: {
                reviews,
                stats: reviewStats,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / parseInt(limit)),
                    totalReviews: total,
                    hasNext: skip + reviews.length < total,
                    hasPrev: parseInt(page) > 1
                }
            }
        });

    } catch (error) {
        console.error('Get product reviews error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// ✅ SỬA LẠI CREATE REVIEW - OPTIONAL PURCHASED CHECK
const createReview = async (req, res) => {
    try {
        const { product: productId, rating, title, comment } = req.body;
        const userId = req.user.userId;

        // Validate required fields
        if (!productId || !rating || !title || !comment) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Validate product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check if user already reviewed this product
        const existingReview = await Review.findOne({
            product: productId,
            user: userId
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this product'
            });
        }

        // ✅ OPTIONAL: Tạm thời bỏ check purchased để test
        // Bạn có thể uncomment dòng này sau khi có đủ orders để test
        /*
        const hasPurchased = await Order.exists({
            user: userId,
            'items.product': productId,
            isPaid: true
        });

        if (!hasPurchased) {
            return res.status(400).json({
                success: false,
                message: 'You can only review products you have purchased'
            });
        }
        */

        // Create review
        const review = new Review({
            product: productId,
            user: userId,
            rating: parseInt(rating),
            title: title.trim(),
            comment: comment.trim()
        });

        await review.save();

        // Populate user info
        await review.populate('user', 'name');

        res.status(201).json({
            success: true,
            message: 'Review created successfully',
            data: review
        });

    } catch (error) {
        console.error('Create review error:', error);
        
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this product'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, title, comment } = req.body;
        const userId = req.user.userId;

        const review = await Review.findOne({ _id: id, user: userId });
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found or not authorized'
            });
        }

        // Update fields
        if (rating) review.rating = parseInt(rating);
        if (title) review.title = title.trim();
        if (comment) review.comment = comment.trim();

        await review.save();
        await review.populate('user', 'name');

        res.json({
            success: true,
            message: 'Review updated successfully',
            data: review
        });

    } catch (error) {
        console.error('Update review error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const review = await Review.findOneAndDelete({ _id: id, user: userId });
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found or not authorized'
            });
        }

        res.json({
            success: true,
            message: 'Review deleted successfully'
        });

    } catch (error) {
        console.error('Delete review error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// @desc    Get user's reviews
// @route   GET /api/reviews/my-reviews
// @access  Private
const getUserReviews = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { page = 1, limit = 10 } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const reviews = await Review.find({ user: userId })
            .populate('product', 'name images slug')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Review.countDocuments({ user: userId });

        res.json({
            success: true,
            data: {
                reviews,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / parseInt(limit)),
                    totalReviews: total,
                    hasNext: skip + reviews.length < total,
                    hasPrev: parseInt(page) > 1
                }
            }
        });

    } catch (error) {
        console.error('Get user reviews error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// @desc    Vote helpful on a review
// @route   POST /api/reviews/:id/helpful
// @access  Private
const voteHelpful = async (req, res) => {
    try {
        const { id } = req.params;
        const { type } = req.body; // 'yes' or 'no'
        const userId = req.user.userId;

        if (!['yes', 'no'].includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid vote type'
            });
        }

        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Remove user from both arrays first
        review.helpfulVotes.yes.pull(userId);
        review.helpfulVotes.no.pull(userId);

        // Add to appropriate array
        review.helpfulVotes[type].push(userId);

        await review.save();

        res.json({
            success: true,
            message: 'Vote recorded successfully',
            data: {
                helpfulVotes: {
                    yes: review.helpfulVotes.yes.length,
                    no: review.helpfulVotes.no.length
                }
            }
        });

    } catch (error) {
        console.error('Vote helpful error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = {
    getProductReviews,
    createReview,
    updateReview,
    deleteReview,
    getUserReviews,
    voteHelpful
};