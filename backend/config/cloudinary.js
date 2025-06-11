// Load environment variables trước
require('dotenv').config();

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Debug environment variables
console.log('🔍 Environment Variables Check:');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME || 'MISSING');
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY || 'MISSING');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'SET' : 'MISSING');

// Kiểm tra nếu thiếu config
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('❌ Missing Cloudinary configuration!');
    console.error('Please check your .env file');
    process.exit(1);
}

// Cấu hình Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

console.log('✅ Cloudinary configured successfully');

// Test connection ngay lập tức
const testConnection = async () => {
    try {
        const result = await cloudinary.api.ping();
        console.log('✅ Cloudinary connection test successful:', result);
    } catch (error) {
        console.error('❌ Cloudinary connection test failed:', error.message);
    }
};

// Chạy test (không blocking)
testConnection();

// Tạo storage cho product images
const productStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'cocktail-miami/products',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [
            { width: 800, height: 800, crop: 'limit', quality: 'auto' }
        ],
        public_id: (req, file) => {
            // Tạo unique filename
            const timestamp = Date.now();
            const randomString = Math.random().toString(36).substring(7);
            return `product_${timestamp}_${randomString}`;
        }
    }
});

// Cập nhật multer config trong cloudinary.js
const uploadProductImages = multer({
    storage: productStorage,
    limits: {
        fileSize: 10 * 1024 * 1024, // Tăng từ 5MB lên 10MB
        files: 15
    },
    fileFilter: (req, file, cb) => {
        console.log('📸 Processing file:', {
            fieldname: file.fieldname,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size ? `${(file.size / 1024 / 1024).toFixed(2)}MB` : 'unknown'
        });
        
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// Function xóa ảnh
const deleteImage = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        console.log('🗑️ Image deleted:', publicId, result);
        return result;
    } catch (error) {
        console.error('❌ Error deleting image:', error);
        throw error;
    }
};

module.exports = {
    cloudinary,
    uploadProductImages,
    deleteImage
};