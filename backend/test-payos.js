// Test PayOS connection
require('dotenv').config();
const PayOS = require('@payos/node');

async function testPayOS() {
    console.log('🧪 Testing PayOS Connection...');
    
    if (!process.env.PAYOS_CLIENT_ID || !process.env.PAYOS_API_KEY || !process.env.PAYOS_CHECKSUM_KEY) {
        console.error('❌ Missing PayOS credentials in .env file');
        return;
    }

    try {
        const payOS = new PayOS(
            process.env.PAYOS_CLIENT_ID,
            process.env.PAYOS_API_KEY,
            process.env.PAYOS_CHECKSUM_KEY
        );

        console.log('✅ PayOS instance created successfully');
        console.log('📊 Client ID:', process.env.PAYOS_CLIENT_ID);

        // Test tạo payment link
        const testPayment = {
            orderCode: parseInt(Date.now().toString().slice(-6)),
            amount: 50000, // 50,000 VND
            description: 'Test payment',
            items: [{
                name: 'Test Product',
                quantity: 1,
                price: 50000
            }],
            returnUrl: 'http://localhost:5173/success',
            cancelUrl: 'http://localhost:5173/cancel'
        };

        console.log('🔄 Testing payment link creation...');
        const paymentLink = await payOS.createPaymentLink(testPayment);
        
        console.log('✅ PayOS Test Successful!');
        console.log('💳 Payment URL:', paymentLink.checkoutUrl);
        console.log('📱 QR Code available:', !!paymentLink.qrCode);

    } catch (error) {
        console.error('❌ PayOS Test Failed:', error.message);
        console.error('📋 Error Details:', error);
    }
}

testPayOS();