// backend/debug-env.js
require('dotenv').config();

console.log('=== Environment Variables Debug ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY);
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT SET');
console.log('Full .env check:');
console.log('- Cloud Name exists:', !!process.env.CLOUDINARY_CLOUD_NAME);
console.log('- API Key exists:', !!process.env.CLOUDINARY_API_KEY);
console.log('- API Secret exists:', !!process.env.CLOUDINARY_API_SECRET);