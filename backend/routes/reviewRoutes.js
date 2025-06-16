const express = require('express');
const { protect } = require('../middleware/auth');
const {
    getProductReviews,
    createReview,
    updateReview,
    deleteReview,
    getUserReviews,
    voteHelpful
} = require('../controllers/reviewController');

const router = express.Router();

// Public routes
router.get('/product/:productId', getProductReviews);

// Protected routes
router.use(protect);
router.post('/', createReview);
router.get('/my-reviews', getUserReviews);
router.put('/:id', updateReview);
router.delete('/:id', deleteReview);
router.post('/:id/helpful', voteHelpful);

module.exports = router;