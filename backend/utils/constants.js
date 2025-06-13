// ✅ SHIPPING CONFIGURATION
const SHIPPING_CONFIG = {
    FREE_SHIPPING_THRESHOLD: 50, // USD - Free shipping over $50
    SHIPPING_FEE: 0.5,             // USD - $1 shipping fee under threshold
    TAX_RATE: 0.08               // 8% tax rate
};

// ✅ PAYMENT CONFIGURATION
const PAYMENT_CONFIG = {
    EXCHANGE_RATE: 24000,           // 1 USD = 24,000 VND
    PAYOS_ORDER_CODE_LENGTH: 6      // Length of PayOS order code
};

// ✅ BUSINESS RULES
const BUSINESS_CONFIG = {
    MIN_ORDER_AMOUNT: 1,            // Minimum order amount in USD
    MAX_ORDER_QUANTITY: 999,        // Maximum quantity per order
    LOW_STOCK_THRESHOLD: 5          // Show "Low Stock" warning when stock <= 5
};

module.exports = {
    SHIPPING_CONFIG,
    PAYMENT_CONFIG,
    BUSINESS_CONFIG
};