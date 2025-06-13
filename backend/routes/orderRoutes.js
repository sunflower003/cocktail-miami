const express = require('express');
const { protect } = require('../middleware/auth');
const {
    createOrder,
    handlePayOSWebhook,
    getUserOrders,
    getOrder,
    getShippingConfig // ✅ IMPORT
} = require('../controllers/orderController');

const router = express.Router();

// ✅ PUBLIC ROUTES
router.post('/payos-webhook', handlePayOSWebhook);
router.get('/shipping-config', getShippingConfig); // ✅ PUBLIC API CHO SHIPPING CONFIG

// Test routes
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Order routes working'
    });
});

// ✅ PROTECTED ROUTES SAU
router.use(protect);

router.route('/')
    .get(getUserOrders)
    .post(createOrder);

router.route('/:id')
    .get(getOrder);

module.exports = router;