const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    checkWishlistStatus,
    clearWishlist
} = require('../controllers/wishlistController');

// Protect all routes
router.use(protect);

// Wishlist routes
router.get('/', getWishlist);
router.post('/:productId', addToWishlist);
router.delete('/:productId', removeFromWishlist);
router.get('/check/:productId', checkWishlistStatus);
router.delete('/', clearWishlist);

module.exports = router;