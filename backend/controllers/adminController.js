
const User = require('../models/User');

// @desc    Get all users with pagination and filters
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const {
            search = '',
            role = '',
            status = '',
            verified = '',
            page = 1,
            limit = 10
        } = req.query;

        // Build query
        let query = {};

        // Search by name or email
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        // Filter by role
        if (role) {
            query.role = role;
        }

        // Filter by status (blocked/active)
        if (status) {
            query.isBlocked = status === 'blocked';
        }

        // Filter by email verification
        if (verified !== '') {
            query.isEmailVerified = verified === 'true';
        }

        // Calculate pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Get total count for pagination
        const total = await User.countDocuments(query);
        const totalPages = Math.ceil(total / limitNum);

        // Get users
        const users = await User.find(query)
            .select('-passwordHash') // Exclude password
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        res.json({
            success: true,
            data: {
                users,
                total,
                totalPages,
                currentPage: pageNum,
                limit: limitNum
            }
        });

    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Get single user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-passwordHash');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: user
        });

    } catch (error) {
        console.error('Get user by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
    try {
        const { name, email, phone, role, isBlocked, isEmailVerified } = req.body;
        
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if email is being changed and if it already exists
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email, _id: { $ne: req.params.id } });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already exists'
                });
            }
        }

        // Update fields
        if (name !== undefined) user.name = name;
        if (email !== undefined) user.email = email;
        if (phone !== undefined) user.phone = phone;
        if (role !== undefined) user.role = role;
        if (isBlocked !== undefined) user.isBlocked = isBlocked;
        if (isEmailVerified !== undefined) user.isEmailVerified = isEmailVerified;

        await user.save();

        res.json({
            success: true,
            message: 'User updated successfully',
            data: user.toJSON()
        });

    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prevent deleting admin users
        if (user.role === 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Cannot delete admin users'
            });
        }

        // Prevent admin from deleting themselves
        if (user._id.toString() === req.user.userId) {
            return res.status(403).json({
                success: false,
                message: 'Cannot delete your own account'
            });
        }

        await User.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'User deleted successfully'
        });

    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Toggle user status (block/unblock)
// @route   PUT /api/admin/users/:id/toggle-status
// @access  Private/Admin
const toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prevent blocking admin users
        if (user.role === 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Cannot block admin users'
            });
        }

        // Prevent admin from blocking themselves
        if (user._id.toString() === req.user.userId) {
            return res.status(403).json({
                success: false,
                message: 'Cannot block your own account'
            });
        }

        user.isBlocked = !user.isBlocked;
        await user.save();

        res.json({
            success: true,
            message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`,
            data: user.toJSON()
        });

    } catch (error) {
        console.error('Toggle user status error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        
        if (!role || !['user', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Valid role is required (user or admin)'
            });
        }

        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prevent admin from changing their own role
        if (user._id.toString() === req.user.userId) {
            return res.status(403).json({
                success: false,
                message: 'Cannot change your own role'
            });
        }

        user.role = role;
        await user.save();

        res.json({
            success: true,
            message: 'User role updated successfully',
            data: user.toJSON()
        });

    } catch (error) {
        console.error('Update user role error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    toggleUserStatus,
    updateUserRole
};