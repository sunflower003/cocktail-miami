const PayOS = require('@payos/node');


// Kiểm tra environment variables
const requiredEnvVars = {
    PAYOS_CLIENT_ID: process.env.PAYOS_CLIENT_ID,
    PAYOS_API_KEY: process.env.PAYOS_API_KEY,
    PAYOS_CHECKSUM_KEY: process.env.PAYOS_CHECKSUM_KEY
};

const missingVars = Object.entries(requiredEnvVars)
    .filter(([key, value]) => !value)
    .map(([key]) => key);

if (missingVars.length > 0) {
    console.warn('⚠️ Missing PayOS environment variables:', missingVars.join(', '));
    console.warn('PayOS features will be disabled. Using COD only mode.');
    module.exports = null;
} else {
    try {
        // Khởi tạo PayOS với log chi tiết
        console.log('🚀 Initializing PayOS with credentials...');
        
        const payOS = new PayOS(
            process.env.PAYOS_CLIENT_ID,
            process.env.PAYOS_API_KEY,
            process.env.PAYOS_CHECKSUM_KEY
        );

        console.log('✅ PayOS configured successfully');
        console.log('📊 PayOS Client ID:', process.env.PAYOS_CLIENT_ID);
        
        module.exports = payOS;
    } catch (error) {
        console.error('❌ PayOS initialization failed:', error.message);
        console.warn('Using COD only mode.');
        module.exports = null;
    }
}