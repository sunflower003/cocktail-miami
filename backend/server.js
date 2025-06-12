// server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const dotenv = require("dotenv");

// Import database connection
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes'); // ADD THIS LINE
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');

// Load environment variables trước
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 100 : 1000 // Stricter trong production
});
app.use(limiter);

// CORS configuration - TỰ ĐỘNG CHUYỂN ĐỔI
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            // Development
            'http://localhost:5173',
            'http://localhost:3000',
            'http://127.0.0.1:5173',
            'http://127.0.0.1:3000',
            
            // Production - THÊM DOMAINS THẬT CỦA BẠN
            'https://cocktail-miami.vercel.app',
            'https://cocktail-miami.onrender.com',
            
            // Environment variables
            process.env.FRONTEND_URL,
            process.env.FRONTEND_URL_PRODUCTION,
            
            // Pattern for preview deployments
            /^https:\/\/cocktail-miami.*\.vercel\.app$/,
            /^https:\/\/.*\.onrender\.com$/,
            
        ].filter(Boolean);

        console.log('🌐 CORS Check - Origin:', origin);
        console.log('🌐 CORS Check - Allowed:', allowedOrigins);

        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) {
            console.log('✅ CORS: No origin - allowing');
            return callback(null, true);
        }

        // Check if origin is allowed
        const isAllowed = allowedOrigins.some(allowedOrigin => {
            if (typeof allowedOrigin === 'string') {
                return allowedOrigin === origin;
            }
            return allowedOrigin.test(origin);
        });

        if (isAllowed) {
            console.log('✅ CORS: Origin allowed');
            callback(null, true);
        } else {
            console.log('❌ CORS: Origin blocked');
            console.log('❌ Blocked origin:', origin);
            console.log('❌ Allowed origins:', allowedOrigins);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
        'Content-Type', 
        'Authorization', 
        'X-Requested-With',
        'Accept',
        'Origin'
    ],
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes); // ADD THIS LINE
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);

// Health check endpoint - ĐẶT TRƯỚC CÁC MIDDLEWARE KHÁC
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Cocktail Miami API is running',
        version: '1.0.0',
        environment: process.env.NODE_ENV
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    let error = { ...err };
    error.message = err.message;

    // CORS error
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({
            success: false,
            message: 'CORS policy violation'
        });
    }

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = { message, statusCode: 404 };
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const message = 'Duplicate field value entered';
        error = { message, statusCode: 400 };
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message);
        error = { message, statusCode: 400 };
    }

    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

const PORT = process.env.PORT || 5000;

// QUAN TRỌNG: Bind to 0.0.0.0 thay vì localhost
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    console.log(`📡 Health check: http://0.0.0.0:${PORT}/health`);
    console.log(`📡 API Base URL: http://0.0.0.0:${PORT}/api`);
    console.log(`👥 Admin Routes: http://0.0.0.0:${PORT}/api/admin`);
    
    if (process.env.NODE_ENV === 'production') {
        console.log(`🌐 Production URL: https://cocktail-miami-api.onrender.com`);
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('Process terminated');
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    process.exit(0);
});
