require('dotenv').config();

console.log('=== Environment Variables Debug ===');
console.log('SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? `${process.env.SENDGRID_API_KEY.substring(0, 10)}...` : 'NOT SET');
console.log('FROM_EMAIL:', process.env.FROM_EMAIL);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');

// Test require sendEmail
try {
    const sendEmail = require('./utils/sendEmail');
    console.log('✅ sendEmail module loaded successfully');
} catch (error) {
    console.error('❌ Failed to load sendEmail module:', error.message);
}