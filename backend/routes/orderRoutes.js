const express = require('express');
const { protect } = require('../middleware/auth');
const {
    createOrder,
    handlePayOSWebhook,
    getUserOrders,
    getOrder,
    getShippingConfig,
    cancelOrder // ✅ THÊM IMPORT cancelOrder
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

// ✅ THÊM ROUTE CANCEL ORDER Ở ĐÂY
router.put('/:id/cancel', cancelOrder);

module.exports = router;