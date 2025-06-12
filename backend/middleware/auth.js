const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
    try {
        let token;

        // Check for token in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Get user from token
            const user = await User.findById(decoded.userId).select('-passwordHash');
            
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Check if user is blocked
            if (user.isBlocked) {
                return res.status(403).json({
                    success: false,
                    message: 'Your account has been blocked'
                });
            }

            req.user = {
                userId: user._id,
                email: user.email,
                role: user.role
            };
            
            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error in authentication'
        });
    }
};

// Authorize roles
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'User role not authorized to access this route'
            });
        }
        
        next();
    };
};

// Legacy aliases for backwards compatibility
const auth = protect;
const adminAuth = authorize('admin');

module.exports = { 
    protect, 
    authorize, 
    auth, 
    adminAuth 
};