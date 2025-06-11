// Tạo file: backend/test-cloudinary.js
require('dotenv').config();
const { cloudinary } = require('./config/cloudinary');

async function testCloudinary() {
    try {
        console.log('🔧 Testing Cloudinary configuration...');
        console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
        console.log('API Key:', process.env.CLOUDINARY_API_KEY);
        console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Not set');

        const result = await cloudinary.api.ping();
        console.log('✅ Cloudinary connection successful:', result);
        
        // Test upload
        const uploadResult = await cloudinary.uploader.upload(
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
            {
                folder: 'cocktail-miami/test',
                public_id: 'test_image'
            }
        );
        console.log('✅ Test upload successful:', uploadResult.secure_url);
        
        // Clean up test image
        await cloudinary.uploader.destroy('cocktail-miami/test/test_image');
        console.log('✅ Test cleanup successful');
        
    } catch (error) {
        console.error('❌ Cloudinary test failed:', error);
    }
}

testCloudinary();